'use server';
import { executeQuery } from '@/lib/db';

export interface CultureOption {
  id: number;
  titulo: string;
  opciones: string[];
}

export async function getCultureOptions(): Promise<CultureOption[]> {
    try {
        const results = await executeQuery<CultureOption[]>('SELECT * FROM culture_options');
        return results.map(row => ({
            ...row,
            options: Array.isArray(row.opciones) ? row.opciones : JSON.parse(row.opciones ?? '[]') as string[]
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createCultureOption(option: Omit<CultureOption, 'id'>): Promise<void> {
    const { titulo, opciones } = option;
    const query = 'INSERT INTO culture_options (title, options) VALUES (?, ?)';
    await executeQuery(query, [titulo, JSON.stringify(opciones)]);
}


export async function deleteCultureOption(id: string): Promise<void> {
  const query = 'DELETE FROM culture_options WHERE id = ?';
  await executeQuery(query, [id]);
}
