"use server";
import { executeQuery } from '@/lib/db';

export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
}

export async function getProviders(): Promise<Proveedor[]> {
    try {
        const results = await executeQuery('SELECT * FROM proveedores');
        return JSON.parse(JSON.stringify(results)) as Proveedor[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createProvider(proveedor: Omit<Proveedor, 'id'>): Promise<void> {
    const { nombre, telefono, email, direccion } = proveedor;
    const query = 'INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)';
    await executeQuery(query, [nombre, telefono, email, direccion]);
}

export async function getProviderById(id: number): Promise<Proveedor | null> {
    const results = await executeQuery<Proveedor[]>('SELECT * FROM proveedores WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Proveedor;
    }
    return null;
}

export async function updateProvider(id: number, proveedor: Partial<Omit<Proveedor, 'id'>>): Promise<void> {
    const { nombre, telefono, email, direccion } = proveedor;
    const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?';
    await executeQuery(query, [nombre, telefono, email, direccion, id]);
}


export async function deleteProvider(id: number): Promise<void> {
  const query = 'DELETE FROM proveedores WHERE id = ?';
  await executeQuery(query, [id]);
}
