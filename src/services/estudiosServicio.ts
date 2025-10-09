
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

async function getParametersForStudy(Id: number): Promise<ParametroEstudioForm[]> {
    const query = `
        SELECT 
            p.id as parametro_id, p.nombre_parametro, p.unidad_medida, p.costo, p.factor_conversion, p.unidad_internacional,
            vr.id as vr_id, vr.tipo_referencia, vr.sexo, vr.edad_inicio, vr.edad_fin, vr.unidad_edad,
            vr.valor_inicio, vr.valor_fin, vr.texto_criterio, vr.posibles_valores, vr.texto_reporte_resultados
        FROM parametros p
        JOIN valores_referencia vr ON p.id = vr.parametro_id
        WHERE p.estudio_id = ?
    `;
    const results = await executeQuery(query, [Id]) as any[];

    // Agrupar valores de referencia por parámetro
    const paramsMap = new Map<number, ParametroEstudioForm>();

    results.forEach(row => {
        if (!paramsMap.has(row.parametro_id)) {
            paramsMap.set(row.parametro_id, {
                nombre_parametro: row.nombre_parametro,
                costo: row.costo,
                factor_conversion: row.factor_conversion,
                unidad_medida: row.unidad_medida,
                unidad_internacional: row.unidad_internacional,
                valoresReferencia: [], // Inicialmente vacío, se llenará después
            });
        }
        
        const paramForm = paramsMap.get(row.parametro_id)!;
        
        const posiblesValoresParsed = JSON.parse(row.posibles_valores || '{}');

        (paramForm.valoresReferencia as any).push({
            tipo_referencia: row.tipo_referencia,
            sexo: row.sexo,
            edad_inicio: row.edad_inicio,
            edad_fin: row.edad_fin,
            unidad_edad: row.unidad_edad,
            valor_inicio: row.valor_inicio,
            valor_fin: row.valor_fin,
            texto_criterio: row.texto_criterio,
            texto_reporte_resultados: row.texto_reporte_resultados,
            posibles_valores_form: {
                valores_opciones: posiblesValoresParsed.valores_opciones || [],
                valor_predeterminado: posiblesValoresParsed.valor_predeterminado || '_NULL_',
                valor_referencia: posiblesValoresParsed.valor_referencia || '',
            },
        });
    });

    return Array.from(paramsMap.values());
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
            const parametroId = await creaParametroEstudio(estudioId, param);
            if (parametroId && param.valoresReferencia) {
                // Ahora `valoresReferencia` es un array, así que iteramos sobre él
                for (const vr of (Array.isArray(param.valoresReferencia) ? param.valoresReferencia : [param.valoresReferencia])) {
                     await creaValoresReferencia(parametroId, estudioId, vr);
                }
            }
        }
    }

    return estudioId;
}

export async function updateEstudio(id: string, study: Omit<Estudio, 'id'>): Promise<void> {
    // Implementación de la actualización...
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

export async function creaValoresReferencia(parametroId: number, estudioId: number, valoresReferencia: any): Promise<void> {
    const query = `
        INSERT INTO valores_referencia(
            parametro_id, estudio_id, tipo_referencia, sexo, edad_inicio,
            edad_fin, unidad_edad, valor_inicio, valor_fin,
            texto_criterio, posibles_valores, texto_reporte_resultados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    // Reconstruir el objeto JSON para 'posibles_valores'
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
