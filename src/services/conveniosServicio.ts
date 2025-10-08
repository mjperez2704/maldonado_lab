"use server";
import { executeQuery } from '@/lib/db';

export interface Convenio {
    id: number;
    title: string;
    descuento: number;
    items?: { type: string, id: number, nombre: string, price: string }[];
}

export async function getConvenios(): Promise<Convenio[]> {
    try {
        const results = await executeQuery('SELECT * FROM convenios');
        return JSON.parse(JSON.stringify(results)) as Convenio[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createConvenio(convenio: Omit<Convenio, 'id'>): Promise<void> {
    const { title, descuento } = convenio;
    const query = 'INSERT INTO convenios (titulos, descuento) VALUES (?, ?)';
    await executeQuery(query, [title, descuento]);
}

export async function getConvenioById(id: number): Promise<Convenio | null> {
    const results = await executeQuery<Convenio[]>('SELECT * FROM convenios WHERE id = ?', [id]);
    if (results.length > 0) {
        const convenio = JSON.parse(JSON.stringify(results[0])) as Convenio;
        return {
            ...convenio,
            items: [], // Item logic is not implemented
        };
    }
    return null;
}

export async function updateConvenio(id: number, convenio: Partial<Omit<Convenio, 'id'>>): Promise<void> {
    const { title, descuento } = convenio;
    const query = 'UPDATE convenios SET titulo = ?, descuento = ? WHERE id = ?';
    await executeQuery(query, [title, descuento, id]);
}


export async function deleteConvenio(id: number): Promise<void> {
  const query = 'DELETE FROM convenios WHERE id = ?';
  await executeQuery(query, [id]);
}
