"use server";
import { executeQuery } from '@/lib/db';

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
    try {
        const results = await executeQuery('SELECT * FROM categorias');
        return JSON.parse(JSON.stringify(results)) as Category[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createCategory(nombre: string): Promise<void> {
  const query = 'INSERT INTO categorias (nombre) VALUES (?)';
  await executeQuery(query, [nombre]);
}

export async function getCategoryById(id: number): Promise<Category | null> {
    const results = await executeQuery<Category[]>('SELECT * FROM categorias WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

export async function updateCategory(id: number, nombre: string): Promise<void> {
  const query = 'UPDATE categorias SET nombre = ? WHERE id = ?';
  await executeQuery(query, [nombre, id]);
}


export async function deleteCategory(id: number): Promise<void> {
  const query = 'DELETE FROM categorias WHERE id = ?';
  await executeQuery(query, [id]);
}
