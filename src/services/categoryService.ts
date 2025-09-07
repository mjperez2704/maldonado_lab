"use server";
import { executeQuery } from '@/lib/db';

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
    try {
        const results = await executeQuery('SELECT * FROM categories');
        return JSON.parse(JSON.stringify(results)) as Category[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createCategory(name: string): Promise<void> {
  const query = 'INSERT INTO categories (name) VALUES (?)';
  await executeQuery(query, [name]);
}

export async function getCategoryById(id: number): Promise<Category | null> {
    const results = await executeQuery<Category[]>('SELECT * FROM categories WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

export async function updateCategory(id: number, name: string): Promise<void> {
  const query = 'UPDATE categories SET name = ? WHERE id = ?';
  await executeQuery(query, [name, id]);
}


export async function deleteCategory(id: number): Promise<void> {
  const query = 'DELETE FROM categories WHERE id = ?';
  await executeQuery(query, [id]);
}
