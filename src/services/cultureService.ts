'use server';
import { executeQuery } from '@/lib/db';

interface Consumos {
    productId: string;
    cantidad: number;
}

export interface Culture {
  id: number;
  categoria_id: string;
  nombre: string;
  tipo_muestra_id: string;
  precio: number;
  precauciones: string;
  comentarios: string[];
  consumos: Consumos[];
}

export async function getCultures(): Promise<Culture[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM cultivos');
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((row: any) => ({
            ...row,
            comentarios: Array.isArray(row.comentarios) ? row.comentarios : JSON.parse(row.comentarios || '[]') as string[],
            consumos: Array.isArray(row.consumos) ? row.consumos : JSON.parse(row.consumos || '[]') as Consumos[],
        }));
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createCulture(culture: Omit<Culture, 'id'>): Promise<void> {
    const { categoria_id, nombre, tipo_muestra_id, precio, precauciones, comentarios, consumos } = culture;
    const query = 'INSERT INTO cultivos (categoria_id, nombre, tipo_muestra_id, precio, precauciones, comentarios, consumos) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [categoria_id, nombre, tipo_muestra_id, precio, precauciones, JSON.stringify(comentarios), JSON.stringify(consumos)]);
}

export async function getCultureById(id: number): Promise<Culture | null> {
    const results = await executeQuery<any[]>('SELECT * FROM cultivos WHERE id = ?', [id]);
     if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            comentarios: Array.isArray(row.comentarios) ? row.comentarios : JSON.parse(row.comentarios || '[]') as string[],
            consumos: Array.isArray(row.consumos) ? row.consumos : JSON.parse(row.consumos || '[]') as Consumos[],
        };
    }
    return null;
}

export async function updateCulture(id: number, culture: Omit<Culture, 'id'>): Promise<void> {
    const { categoria_id, nombre, tipo_muestra_id, precio, precauciones, comentarios, consumos } = culture;
    const query = 'UPDATE cultivos SET categorias = ?, nombre = ?, tipo_muestra_id = ?, precio = ?, precauciones = ?, comentarios = ?, consumos = ? WHERE id = ?';
    await executeQuery(query, [categoria_id, nombre, tipo_muestra_id, precio, precauciones, JSON.stringify(comentarios), JSON.stringify(consumos), id]);
}


export async function deleteCulture(id: number): Promise<void> {
  const query = 'DELETE FROM cultivos WHERE id = ?';
  await executeQuery(query, [id]);
}
