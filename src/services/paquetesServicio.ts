"use server";
import { executeQuery } from '@/lib/db';
import { getEstudioIdByName } from '@/services/estudiosServicio';

export interface Paquetes {
    id: number;
    nombre: string;
    abreviatura: string;
    precio: number;
    precauciones: string;
    tipo: 'estudios' | 'cultivos';
    estudios: string[];
    cultivos: string[];
}

export async function getPaquetesEstudios(): Promise<Paquetes[]> {
    try {
        const results = await executeQuery<any[]>('SELECT p.nombre, p.abreviatura, p.precio, ' + 
            'p.precauciones, p.tipo, JSON_ARRAY(e.nombre) AS estudios, ' +
            'JSON_ARRAY(c.nombre) AS cultivos FROM paquetes p ' +
            'LEFT JOIN paquete_estudios pe ON p.id = pe.paquete_id ' + 
            'LEFT JOIN estudios e ON pe.estudio_id = e.id ' +
            'LEFT JOIN paquete_cultivos pc ON p.id = pc.paquete_id ' + 
            'LEFT JOIN cultivos c ON pc.cultivo_id = c.id ' +
            'WHERE p.tipo = "estudios" GROUP BY tipo');
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((pkg: any) => ({
            ...pkg,
            estudios: Array.isArray(pkg.estudios) ? pkg.estudios : JSON.parse(pkg.estudios || '[]'),
            cultivos: Array.isArray(pkg.cultivos) ? pkg.cultivos : JSON.parse(pkg.cultivos || '[]')
        }));
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createPaqueteEstudios(pkg: Omit<Paquetes, 'id'>): Promise<void> {
    const { nombre, abreviatura, precio, precauciones, tipo, estudios } = pkg;
    const query = 'INSERT INTO paquetes (nombre, abreviatura, precio, precauciones, tipo) VALUES (?, ?, ?, ?, ?)';
    //await executeQuery(query, [nombre, abreviatura, precio, precauciones, JSON.stringify(estudios), JSON.stringify(cultivos)]);
    await executeQuery(query, [nombre, abreviatura, precio, precauciones, tipo]);
    const results = await executeQuery<any[]>('SELECT LAST_INSERT_ID()');
    const lastId = results[0]['LAST_INSERT_ID()'];
    createPaqueteEstudiosDetalle(lastId, estudios);
}

export async function createPaqueteEstudiosDetalle(id_paquete: number, estudios: string[]): Promise<void> {
    //var estudio_id = 0;
    for (const estudio of estudios) {
        const estudio_id = await getEstudioIdByName(estudio);
        const query = 'INSERT INTO paquete_estudios (paquete_id, estudio_id) VALUES (?, ?)';
        await executeQuery(query, [id_paquete, estudio_id]);
    }
}

export async function createPaqueteCultivos(pkg: Omit<Paquetes, 'id'>): Promise<void> {
    const { nombre, abreviatura, precio, precauciones, tipo } = pkg;
    const query = 'INSERT INTO paquetes (nombre, abreviatura, precio, precauciones, tipo) VALUES (?, ?, ?, ?, ?)';
    //await executeQuery(query, [nombre, abreviatura, precio, precauciones, JSON.stringify(estudios), JSON.stringify(cultivos)]);
    await executeQuery(query, [nombre, abreviatura, precio, precauciones, tipo]);
}

export async function createPaqueteCultivosDetalle(id_paquete: number, id_cultivo: number): Promise<void> {
    const query = 'INSERT INTO paquete_cultivos (paquete_id, cultivo_id) VALUES (?, ?)';
    await executeQuery(query, [id_paquete, id_cultivo]);
}
 

export async function getPaqueteById(id: number): Promise<Paquetes | null> {
    const results = await executeQuery<any[]>('SELECT * FROM paquetes WHERE id = ?', [id]);
    if (results.length > 0) {
        const pkg = JSON.parse(JSON.stringify(results[0]));
        return {
            ...pkg,
            estudios: Array.isArray(pkg.estudios) ? pkg.estudios : JSON.parse(pkg.estudios || '[]') as string[],
            cultivos: Array.isArray(pkg.cultivos) ? pkg.cultivos : JSON.parse(pkg.cultivos || '[]') as string[]
        };
    }
    return null;
}

export async function getPaqueteIdByName(nombre: string): Promise<Paquetes | null> {
    const results = await executeQuery<any[]>('SELECT id,nombre FROM paquetes WHERE nombre = ?', [nombre]);
    if (results.length > 0) {
        const pkg: any = results[0].id;
        return pkg
    }
    return null;
}

export async function updatePaquete(id: number, pkg: Omit<Paquetes, 'id'>): Promise<void> {
    const { nombre, abreviatura, precio, precauciones, estudios, cultivos } = pkg;
    const query = 'UPDATE paquetes SET nombre = ?, abreviatura = ?, precio = ?, precauciones = ?, estudios = ?, cultivos = ? WHERE id = ?';
    await executeQuery(query, [nombre, abreviatura, precio, precauciones, JSON.stringify(estudios), JSON.stringify(cultivos), id]);
}


export async function deletePaquete(id: number): Promise<void> {
    const query = 'DELETE FROM paquetes WHERE id = ?';
    await executeQuery(query, [id]);
}
