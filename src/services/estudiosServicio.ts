
'use server';

import { executeQuery } from '@/lib/db';
import type { Estudio, ParametroEstudio, ValoresReferencia } from '@/types/study';

// Funciones de la base de datos que ya no necesitan las definiciones de interfaz aquí

export async function getStudies(): Promise<Estudio[]> {
    try {
        const results = await executeQuery('SELECT * FROM estudios');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            precio: Number(row.precio) || 0,
            parameters: [], // Los parámetros se deben cargar por separado
            configuracion: JSON.parse(row.configuracion || '{}'),
            integratedStudies: JSON.parse(row.integratedStudies || '[]'),
            sinonimo: JSON.parse(row.sinonimo || '[]'),
            muestras: JSON.parse(row.muestras || '[]'),
        }));
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function crearEstudio(study: Omit<Estudio, 'id' | 'parameters'>): Promise<number> {
    const query = `
        INSERT INTO estudios (
            area, codigo, nombre, metodo, costoInterno, precio, tiempoEntrega, unidadEntrega,
            tiempoProceso, diasProceso, indicaciones, esSubcontratado, laboratorio_externo_id,
            codigoExterno, costoExterno, tiempoEntregaExterno, leyenda, descripcionCientifica,
            claveServicioSat, claveUnidadSat, configuracion, tieneSubestudios, esPaquete,
            tipo_muestra_id, categoria_id, abreviatura, integratedStudies, sinonimo, muestras
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno, study.precio,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.indicaciones, study.esSubcontratado, study.laboratorio_externo_id, study.codigoExterno,
        study.costoExterno, study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServicioSat, study.claveUnidadSat, JSON.stringify(study.configuracion),
        study.tieneSubestudios, study.esPaquete, study.tipo_muestra_id, study.categoria_id,
        study.abreviatura, JSON.stringify(study.integratedStudies),
        JSON.stringify(study.sinonimo), JSON.stringify(study.muestras)
    ];
    const result = await executeQuery(query, params) as any;
    return result.insertId;
}

export async function updateEstudio(id: string, study: Omit<Estudio, 'id'>): Promise<void> {
    // Implementación de la actualización...
}

export async function deleteEstudio(id: string): Promise<void> {
    const query = 'DELETE FROM estudios WHERE id = ?';
    await executeQuery(query, [id]);
}

export async function getEstudioById(id: string): Promise<Estudio | null> {
    // Implementación de la obtención por ID...
    return null;
}

export async function creaParametroEstudio(parametroEstudio: Omit<ParametroEstudio, 'id'>): Promise<number> {
    const query = `
        INSERT INTO parametros (estudio_id, nombre_parametro, unidad_medida, costo, factor_conversion, unidad_internacional) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        parametroEstudio.estudio_id, parametroEstudio.nombre_parametro,
        parametroEstudio.unidad_medida, parametroEstudio.costo,
        parametroEstudio.factor_conversion, parametroEstudio.unidad_internacional
    ];
    const result = await executeQuery(query, params) as any;
    return result.insertId;
}

export async function creaValoresReferencia(valoresReferencia: Omit<ValoresReferencia, 'id'>): Promise<void> {
    const query = `
        INSERT INTO valores_referencia(
            parametro_id, estudio_id, tipo_referencia, sexo, edad_inicio,
            edad_fin, unidad_edad, valor_inicio, valor_fin,
            texto_criterio, posibles_valores, texto_reporte_resultados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        valoresReferencia.parametro_id, valoresReferencia.estudio_id, valoresReferencia.tipo_referencia,
        valoresReferencia.sexo, valoresReferencia.edad_inicio, valoresReferencia.edad_fin,
        valoresReferencia.unidad_edad, valoresReferencia.valor_inicio, valoresReferencia.valor_fin,
        valoresReferencia.texto_criterio, valoresReferencia.posibles_valores,
        valoresReferencia.texto_reporte_resultados
    ];
    await executeQuery(query, params);
}
