
'use server';
import { executeQuery } from '@/lib/db';

export interface ParametroEstudio {
    estudio_id: number;
    nombre: string;
    unidad_medida: string;
    costo: number;
    factor: string;
    tipo_referencia: string;
    sexo: string;
    edad_inicio: number;
    edad_fin: number;
    unidad_edad: 'Anos' | 'Meses' | 'Dias';
    referencia_inicio_f?: string;
    referencia_fin_f?: string;
    referencia_inicio_m?: string;
    referencia_fin_m?: string;
    referencia_inicio_a?: string;
    referencia_fin_a?: string; 
    texto_referencia?: string;
    factorConversion?: number;
    unidadConversion?: string;
    // New fields for 'Mixto' type
    posiblesValores?: string[];
    valorDefault?: string;
    valorReferencia?: string;
    // New field for 'Criterio R' type
    referenceText?: string;
}

export interface IntegratedEstudioRef {
    id: number;
    nombre: string;
}

export interface MuestraEstudio {
    type: string;
    container: string;
    indications: string;
    cost: number;
}

export interface Estudio {
    id: number;
    area: string;
    codigo: string;
    nombre: string;
    metodo: string;
    costoInterno: number;
    precio: number;
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
    claveServicioSat: string;
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
    tieneSubestudios: boolean;
    esPaquete: boolean;
    integratedStudies: IntegratedEstudioRef[];
    sinonimo: string[];
    muestras: MuestraEstudio[];
    tipo_muestra_id: string;
    categoria: string;
    abreviatura: string;
}

export async function getStudies(): Promise<Estudio[]> {
    try {
        const results = await executeQuery('SELECT * FROM estudios');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            precio: Number(row.precio) || 0,
            parameters: JSON.parse(row.parameters || '[]'),
            configuracion: JSON.parse(row.configuracion || '{}'),
            }));
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function crearEstudio(study: Omit<Estudio, 'id'>): Promise<void> {
    const query = `
        INSERT INTO estudios (
            area, codigo, nombre, metodo, costoInterno, tiempoEntrega, unidadEntrega,
            tiempoProceso, diasProceso, esSubcontratado, laboratorio_externo_id, coidgoExterno,
            costoExterno, tiempoEntregaExterno, leyenda, descripcionCientifica,
            claveServicioSat, claveUnidadSat, parameters, configuracion, tieneSubestudios, esPaquete,
            precio, tipo_muestra_id, categoria, abreviatura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.esSubcontratado, study.laboratorio_externo_id, study.coidgoExterno, study.costoExterno,
        study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServicioSat, study.claveUnidadSat, JSON.stringify(study.parameters),
        JSON.stringify(study.configuracion), study.tieneSubestudios, study.esPaquete,
        study.precio, study.tipo_muestra_id, study.categoria, study.abreviatura,
    ];
    await executeQuery(query, params);
}

export async function getEstudioById(id: string): Promise<Estudio | null> {
    const results = await executeQuery('SELECT * FROM estudios WHERE id = ?', [id]) as any[];
    if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            precio: Number(row.precio) || 0,
            configuracion: JSON.parse(row.configuracion || '{}'),
        };
    }
    return null;
}

export async function updateEstudio(id: string, study: Omit<Estudio, 'id'>): Promise<void> {
    const query = `
        UPDATE estudios SET
            area = ?, codigo = ?, nombre = ?, metodo = ?, costoInterno = ?, precio = ?, tiempoEntrega = ?, 
            unidadEntrega = ?, tiempoProceso = ?, diasProceso = ?, esSubcontratado = ?, 
            laboratorio_externo_id = ?, coidgoExterno = ?, costoExterno = ?, 
            tiempoEntregaExterno = ?, leyenda = ?, descripcionCientifica = ?, 
            claveServicioSat = ?, claveUnidadSat = ?, configuracion = ?, 
            tieneSubestudios = ?, esPaquete = ?, 
            tipo_muestra_id = ?, categoria = ?, abreviatura = ?
        WHERE id = ?
    `;
    const params = [
        study.area, study.codigo, study.nombre, study.metodo, study.costoInterno, study.precio,
        study.tiempoEntrega, study.unidadEntrega, study.tiempoProceso, study.diasProceso,
        study.esSubcontratado, study.laboratorio_externo_id, study.coidgoExterno, study.costoExterno,
        study.tiempoEntregaExterno, study.leyenda, study.descripcionCientifica,
        study.claveServicioSat, study.claveUnidadSat, JSON.stringify(study.configuracion), study.tieneSubestudios, study.esPaquete,
        study.tipo_muestra_id, study.categoria, study.abreviatura,
        id
    ];
    await executeQuery(query, params);
}

export async function deleteEstudio(id: string): Promise<void> {
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
