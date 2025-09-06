'use server';
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface CultureOption {
  id: number;
  title: string;
  options: string[];
}

export async function getCultureOptions(): Promise<CultureOption[]> {
    try {
        const results = await executeQuery<CultureOption[]>('SELECT * FROM culture_options', []);
        return results.map(row => ({
            ...row,
            options: Array.isArray(row.options) ? row.options : JSON.parse(row.options ?? '[]') as string[]
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createCultureOption(option: Omit<CultureOption, 'id'>): Promise<void> {
    const { title, options } = option;
    const query = 'INSERT INTO culture_options (title, options) VALUES (?, ?)';
    await executeQuery(query, [title, JSON.stringify(options)]);
}


export async function deleteCultureOption(id: string): Promise<void> {
  const query = 'DELETE FROM culture_options WHERE id = ?';
  await executeQuery(query, [id]);
}
