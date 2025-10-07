
'use server';
import { executeQuery } from '@/lib/db';

export interface ParametroEstudio {
    estudio_id: number;
    nombre: string;
    unidad_medida: string;
    costo: number;
    factor: string;
    tipo_referencia: string;
    sexo: 'Hombre' | 'Mujer' | 'Ambos';
    edad_inicio: number;
    edad_fin: number;
    unidad_edad: 'Anos' | 'Meses' | 'Dias';
    referencia_inicio_f?: string;
    referencia_fin_f?: string;
    referencia_inicio_m?: string;
    referencia_fin_m?: string;
    referencia_inicio_a?: string; 
    texto_referencia?: string;
    factorConversion?: number;
    unidadConversion?: string;
    // New fields for 'Mixto' type
    posibleaValores?: string[];
    valorDefault?: string;
    valorReferencia?: string;
    // New field for 'Criterio R' type
    referenceText?: string;
}

export interface IntegratedStudyRef {
    id: number;
    nombre: string;
}

export interface StudySample {
    type: string;
    container: string;
    indications: string;
    cost: number;
}

export interface Study {
    id: number;
    area: string;
    codigo: string;
    nombre: string;
    metodo: string;
    costoInterno: number;
    tiempoEntrega: number;
    unidadEntrega: 'dias' | 'horas';
    tiempoProceso: string;
    diasProceso: string;
    esSubcontratado: boolean;
    laboratorio_externo_id: string;
    coidgoExterno: string;
    costoExterno: number;
    tiempoEntregaExterno: string;
    leyenda: string;
    descripcionCientifica: string;
    claveServiciSat: string;
    claveUnidadSat: string;
    parameters: ParametroEstudio[];
    configuracion: {
        showInRequest: boolean;
        canUploadDocuments: boolean;
        printLabSignature: boolean;
        printWebSignature: boolean;
        hasEnglishHeaders: boolean;
        printWithParams: boolean;
        generateWorkOrder: boolean;
    };
    hasSubStudies: boolean;
    isPackage: boolean;
    integratedStudies: IntegratedStudyRef[];
    sinonimo: string[];
    muestras: StudySample[];
    precio: number;
    tipo_muestra_id: string;
    categoria: string;
    abreviatura: string;
}

export async function getStudies(): Promise<Study[]> {
    try {
        const results = await executeQuery('SELECT * FROM estudios');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            precio: Number(row.precio) || Number(row.costoInterno) || 0,
            parameters: JSON.parse(row.parameters || '[]'),
            config: JSON.parse(row.config || '{}'),
            integratedStudies: JSON.parse(row.integratedStudies || '[]'),
            synonyms: JSON.parse(row.synonyms || '[]'),
            samples: JSON.parse(row.samples || '[]'),
        }));
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createStudy(study: Omit<Study, 'id'>): Promise<void> {
    const query = `
        INSERT INTO estudios (
            area, codigo, nombre, metodo, costoInterno, tiempoEntrega, unidadEntrega,
            tiempoProceso, diasProceso, esSubcontratado, laboratorio_externo_id, coidgoExterno,
            costoExterno, tiempoEntregaExterno, leyenda, descripcionCientifica,
            claveServiciSat, claveUnidadSat, parameters, config, hasSubStudies, isPackage,
            integratedStudies, synonyms, samples, price, sampleType, category, shortcut
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.esSubcontratado, study.laboratorio_externo_id, study.coidgoExterno, study.costoExterno,
        study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServiciSat, study.claveUnidadSat, JSON.stringify(study.parameters),
        JSON.stringify(study.configuracion), study.hasSubStudies, study.isPackage,
        JSON.stringify(study.integratedStudies), JSON.stringify(study.sinonimo),
        JSON.stringify(study.muestras), study.precio, study.tipo_muestra_id, study.categoria, study.abreviatura,
    ];
    await executeQuery(query, params);
}

export async function getStudyById(id: string): Promise<Study | null> {
    const results = await executeQuery('SELECT * FROM estudios WHERE id = ?', [id]) as any[];
    if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            price: Number(row.price) || Number(row.costoInterno) || 0,
            parameters: JSON.parse(row.parameters || '[]'),
            config: JSON.parse(row.config || '{}'),
            integratedStudies: JSON.parse(row.integratedStudies || '[]'),
            synonyms: JSON.parse(row.synonyms || '[]'),
            samples: JSON.parse(row.samples || '[]'),
        };
    }
    return null;
}

export async function updateStudy(id: string, study: Omit<Study, 'id'>): Promise<void> {
    const query = `
        UPDATE estudios SET
            area = ?, codigo = ?, nombre = ?, metodo = ?, costoInterno = ?, tiempoEntrega = ?, 
            unidadEntrega = ?, tiempoProceso = ?, diasProceso = ?, esSubcontratado = ?, 
            laboratorio_externo_id = ?, coidgoExterno = ?, costoExterno = ?, 
            tiempoEntregaExterno = ?, leyenda = ?, descripcionCientifica = ?, 
            claveServiciSat = ?, claveUnidadSat = ?, parameters = ?, config = ?, 
            hasSubStudies = ?, isPackage = ?, integratedStudies = ?, synonyms = ?, 
            samples = ?, price = ?, sampleType = ?, category = ?, shortcut = ?
        WHERE id = ?
    `;
    const params = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.esSubcontratado, study.laboratorio_externo_id, study.coidgoExterno, study.costoExterno,
        study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServiciSat, study.claveUnidadSat, JSON.stringify(study.parameters),
        JSON.stringify(study.configuracion), study.hasSubStudies, study.isPackage,
        JSON.stringify(study.integratedStudies), JSON.stringify(study.sinonimo),
        JSON.stringify(study.muestras), study.precio, study.tipo_muestra_id, study.categoria, study.abreviatura,
        id
    ];
    await executeQuery(query, params);
}

export async function deleteStudy(id: string): Promise<void> {
    const query = 'DELETE FROM estudios WHERE id = ?';
    await executeQuery(query, [id]);
}

export async function getEstudioIdByName(nombre: string): Promise<Number> {
    const results = await executeQuery('SELECT id, nombre FROM estudios WHERE nombre = ?', [nombre]) as any[];
    if (results.length > 0) {
        return results[0].id;
    }
    return 0;
}


