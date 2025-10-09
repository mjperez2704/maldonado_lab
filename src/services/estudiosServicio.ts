

'use server';

import { executeQuery } from '@/lib/db';
import type { Estudio, ParametroEstudioForm, ValoresReferencia, IntegratedEstudioRef, MuestraEstudio } from '@/types/study';

export async function getStudies(): Promise<Estudio[]> {
    try {
        const results = await executeQuery('SELECT * FROM estudios');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        
        const studies = await Promise.all(plainResults.map(async (row: any) => {
            const parameters = await getParametersForStudy(row.id);
            return {
                ...row,
                precio: Number(row.precio) || 0,
                parameters: parameters,
                configuracion: JSON.parse(row.configuracion || '{}'),
                integratedStudies: JSON.parse(row.integratedStudies || '[]'),
                sinonimo: JSON.parse(row.sinonimo || '[]'),
                muestras: JSON.parse(row.muestras || '[]'),
            };
        }));
        return studies;
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

async function getParametersForStudy(estudioId: number): Promise<ParametroEstudioForm[]> {
    const query = `
        SELECT 
            p.id as parametro_id, p.nombre_parametro, p.unidad_medida, p.costo, p.factor_conversion, p.unidad_internacional,
            vr.id as vr_id, vr.tipo_referencia, vr.sexo, vr.edad_inicio, vr.edad_fin, vr.unidad_edad,
            vr.valor_inicio, vr.valor_fin, vr.texto_criterio, vr.posibles_valores, vr.texto_reporte_resultados
        FROM parametros p
        LEFT JOIN valores_referencia vr ON p.id = vr.parametro_id
        WHERE p.estudio_id = ?
    `;
    const results = await executeQuery(query, [estudioId]) as any[];

    // Agrupar por nombre de parámetro, ya que un parámetro puede tener múltiples filas de valores de referencia.
    const paramsGroupedByName = results.reduce((acc, row) => {
        if (!acc[row.nombre_parametro]) {
            acc[row.nombre_parametro] = [];
        }
        acc[row.nombre_parametro].push(row);
        return acc;
    }, {} as Record<string, any[]>);

    const finalParams: ParametroEstudioForm[] = Object.values(paramsGroupedByName).map((paramRows: any) => {
        // Tomamos los datos del parámetro de la primera fila, ya que son los mismos para todas las reglas de VR
        const firstRow = paramRows[0];
        
        const paramForm: ParametroEstudioForm = {
            nombre_parametro: firstRow.nombre_parametro,
            costo: firstRow.costo,
            factor_conversion: firstRow.factor_conversion,
            unidad_medida: firstRow.unidad_medida,
            unidad_internacional: firstRow.unidad_internacional,
            // Solo una regla de VR por entrada de parámetro
            valoresReferencia: {
                tipo_referencia: firstRow.tipo_referencia,
                sexo: firstRow.sexo,
                edad_inicio: firstRow.edad_inicio,
                edad_fin: firstRow.edad_fin,
                unidad_edad: firstRow.unidad_edad,
                valor_inicio: firstRow.valor_inicio,
                valor_fin: firstRow.valor_fin,
                texto_criterio: firstRow.texto_criterio,
                posibles_valores_form: JSON.parse(firstRow.posibles_valores || '{}'),
                texto_reporte_resultados: firstRow.texto_reporte_resultados
            }
        };
        return paramForm;
    });

    // En realidad, dado el nuevo flujo, cada fila en la BD es un parámetro en la UI.
    // La lógica de agrupación anterior no es estrictamente necesaria si se guarda una fila por regla.
    // La dejaremos así por ahora pero el guardado es la clave.
    return results.map(row => {
         const posiblesValoresParsed = JSON.parse(row.posibles_valores || '{}');
         return {
            nombre_parametro: row.nombre_parametro,
            costo: row.costo,
            factor_conversion: row.factor_conversion,
            unidad_medida: row.unidad_medida,
            unidad_internacional: row.unidad_internacional,
            valoresReferencia: {
                tipo_referencia: row.tipo_referencia,
                sexo: row.sexo,
                edad_inicio: row.edad_inicio,
                edad_fin: row.edad_fin,
                unidad_edad: row.unidad_edad,
                valor_inicio: row.valor_inicio,
                valor_fin: row.valor_fin,
                texto_criterio: row.texto_criterio,
                posibles_valores_form: {
                    valores_opciones: posiblesValoresParsed.valores_opciones || [],
                    valor_predeterminado: posiblesValoresParsed.valor_predeterminado || '_NULL_',
                    valor_referencia: posiblesValoresParsed.valor_referencia || '',
                },
                texto_reporte_resultados: row.texto_reporte_resultados
            }
         }
    });
}


export async function crearEstudio(study: Omit<Estudio, 'id'>): Promise<number> {
    const studyQuery = `
        INSERT INTO estudios (
            area, codigo, nombre, metodo, costoInterno, precio, tiempoEntrega, unidadEntrega,
            tiempoProceso, diasProceso, indicaciones, esSubcontratado, laboratorio_externo_id,
            codigoExterno, costoExterno, tiempoEntregaExterno, leyenda, descripcionCientifica,
            claveServicioSat, claveUnidadSat, configuracion, tieneSubestudios, esPaquete,
            tipo_muestra_id, categoria_id, abreviatura, integratedStudies, sinonimo, muestras
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const studyParams = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno, study.precio,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.indicaciones, study.esSubcontratado, study.laboratorio_externo_id, study.codigoExterno,
        study.costoExterno, study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServicioSat, study.claveUnidadSat, JSON.stringify(study.configuracion),
        study.tieneSubestudios, study.esPaquete, study.tipo_muestra_id, study.categoria_id,
        study.abreviatura, JSON.stringify(study.integratedStudies),
        JSON.stringify(study.sinonimo), JSON.stringify(study.muestras)
    ];
    const result = await executeQuery(studyQuery, studyParams) as any;
    const estudioId = result.insertId;

    if (estudioId && study.parameters) {
        for (const param of study.parameters) {
            // Cada parámetro en la UI es una entrada separada en la BD, incluso si comparten nombre.
            const parametroId = await creaParametroEstudio(estudioId, param);
            await creaValoresReferencia(parametroId, estudioId, param.valoresReferencia);
        }
    }

    return estudioId;
}

export async function updateEstudio(id: string, study: Omit<Estudio, 'id'>): Promise<void> {
    // Primero, actualizamos los datos principales del estudio
    const studyQuery = `
        UPDATE estudios SET
            area = ?, codigo = ?, nombre = ?, metodo = ?, costoInterno = ?, precio = ?, tiempoEntrega = ?, unidadEntrega = ?,
            tiempoProceso = ?, diasProceso = ?, indicaciones = ?, esSubcontratado = ?, laboratorio_externo_id = ?,
            codigoExterno = ?, costoExterno = ?, tiempoEntregaExterno = ?, leyenda = ?, descripcionCientifica = ?,
            claveServicioSat = ?, claveUnidadSat = ?, configuracion = ?, tieneSubestudios = ?, esPaquete = ?,
            tipo_muestra_id = ?, categoria_id = ?, abreviatura = ?, integratedStudies = ?, sinonimo = ?, muestras = ?
        WHERE id = ?
    `;
    const studyParams = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno, study.precio,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.indicaciones, study.esSubcontratado, study.laboratorio_externo_id, study.codigoExterno,
        study.costoExterno, study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServicioSat, study.claveUnidadSat, JSON.stringify(study.configuracion),
        study.tieneSubestudios, study.esPaquete, study.tipo_muestra_id, study.categoria_id,
        study.abreviatura, JSON.stringify(study.integratedStudies),
        JSON.stringify(study.sinonimo), JSON.stringify(study.muestras), id
    ];
    await executeQuery(studyQuery, studyParams);

    // Borramos los parámetros y valores de referencia existentes para reinsertarlos.
    // Esta es la forma más simple de sincronizar los cambios.
    await executeQuery('DELETE FROM valores_referencia WHERE estudio_id = ?', [id]);
    await executeQuery('DELETE FROM parametros WHERE estudio_id = ?', [id]);
    
    // Re-insertamos los parámetros como si fueran nuevos.
    if (study.parameters) {
        for (const param of study.parameters) {
            const parametroId = await creaParametroEstudio(Number(id), param);
            await creaValoresReferencia(parametroId, Number(id), param.valoresReferencia);
        }
    }
}

export async function deleteEstudio(id: string): Promise<void> {
    const query = 'DELETE FROM estudios WHERE id = ?';
    await executeQuery(query, [id]);
}

export async function getEstudioById(id: string): Promise<Estudio | null> {
    const results = await executeQuery<any[]>('SELECT * FROM estudios WHERE id = ?', [id]);
    if (results.length === 0) {
        return null;
    }
    const row = JSON.parse(JSON.stringify(results[0]));
    const parameters = await getParametersForStudy(row.id);

    return {
        ...row,
        precio: Number(row.precio) || 0,
        parameters: parameters,
        configuracion: JSON.parse(row.configuracion || '{}'),
        integratedStudies: JSON.parse(row.integratedStudies || '[]'),
        sinonimo: JSON.parse(row.sinonimo || '[]'),
        muestras: JSON.parse(row.muestras || '[]'),
    };
}

export async function getEstudioIdByName(nombre: string): Promise<Estudio | null> {
    const results = await executeQuery<any[]>('SELECT id,nombre FROM estudios WHERE nombre = ?', [nombre]);
    if (results.length > 0) {
        const est: any = results[0].id;
        return est
    }
    return null;
}

export async function creaParametroEstudio(estudioId: number, parametro: ParametroEstudioForm): Promise<number> {
    const query = `
        INSERT INTO parametros (estudio_id, nombre_parametro, unidad_medida, costo, factor_conversion, unidad_internacional) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        estudioId, parametro.nombre_parametro,
        parametro.unidad_medida, parametro.costo,
        parametro.factor_conversion, parametro.unidad_internacional
    ];
    const result = await executeQuery(query, params) as any;
    return result.insertId;
}

export async function creaValoresReferencia(parametroId: number, estudioId: number, valoresReferencia: ValoresReferencia): Promise<void> {
    const query = `
        INSERT INTO valores_referencia(
            parametro_id, estudio_id, tipo_referencia, sexo, edad_inicio,
            edad_fin, unidad_edad, valor_inicio, valor_fin,
            texto_criterio, posibles_valores, texto_reporte_resultados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const posiblesValoresJson = JSON.stringify({
        valores_opciones: valoresReferencia.posibles_valores_form?.valores_opciones || [],
        valor_predeterminado: valoresReferencia.posibles_valores_form?.valor_predeterminado || '_NULL_',
        valor_referencia: valoresReferencia.posibles_valores_form?.valor_referencia || ''
    });

    const params = [
        parametroId, estudioId, valoresReferencia.tipo_referencia,
        valoresReferencia.sexo, valoresReferencia.edad_inicio, valoresReferencia.edad_fin,
        valoresReferencia.unidad_edad, valoresReferencia.valor_inicio, valoresReferencia.valor_fin,
        valoresReferencia.texto_criterio, posiblesValoresJson,
        valoresReferencia.texto_reporte_resultados
    ];
    await executeQuery(query, params);
}
