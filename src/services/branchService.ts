"use server";
import { executeQuery } from '@/lib/db';

export interface Branch {
  id: number;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
}

export async function getBranches(): Promise<Branch[]> {
    try {
        const results = await executeQuery('SELECT * FROM sucursales');
        return JSON.parse(JSON.stringify(results)) as Branch[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createBranch(branch: Omit<Branch, 'id'>): Promise<void> {
    try {
        const { nombre, telefono, direccion } = branch;
        const query = 'INSERT INTO sucursales (nombre, telefono, direccion) VALUES (?, ?, ?)';
        await executeQuery(query, [nombre, telefono, direccion]);
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        //return [];
    }
}

export async function getBranchById(id: number): Promise<Branch | null> {
    const results = await executeQuery<Branch[]>('SELECT * FROM sucursales WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
}

export async function updateBranch(id: number, branch: Partial<Omit<Branch, 'id'>>): Promise<void> {
    const { nombre, telefono, direccion } = branch;
    const query = 'UPDATE branches SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?';
    await executeQuery(query, [nombre, telefono, direccion, id]);
}


export async function deleteBranch(id: number): Promise<void> {
  const query = 'DELETE FROM sucursales WHERE id = ?';
  await executeQuery(query, [id]);
}
