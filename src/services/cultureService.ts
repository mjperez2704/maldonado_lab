'use server';
import { executeQuery } from '@/lib/db';

interface Consumption {
    productId: string;
    quantity: number;
}

export interface Culture {
  id: number;
  category: string;
  name: string;
  sampleType: string;
  price: number;
  precautions: string;
  comments: string[];
  consumptions: Consumption[];
}

export async function getCultures(): Promise<Culture[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM cultures');
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((row: any) => ({
            ...row,
            comments: Array.isArray(row.comments) ? row.comments : JSON.parse(row.comments || '[]') as string[],
            consumptions: Array.isArray(row.consumptions) ? row.consumptions : JSON.parse(row.consumptions || '[]') as Consumption[],
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createCulture(culture: Omit<Culture, 'id'>): Promise<void> {
    const { category, name, sampleType, price, precautions, comments, consumptions } = culture;
    const query = 'INSERT INTO cultures (category, name, sampleType, price, precautions, comments, consumptions) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [category, name, sampleType, price, precautions, JSON.stringify(comments), JSON.stringify(consumptions)]);
}

export async function getCultureById(id: string): Promise<Culture | null> {
    const results = await executeQuery<any[]>('SELECT * FROM cultures WHERE id = ?', [id]);
     if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            comments: Array.isArray(row.comments) ? row.comments : JSON.parse(row.comments || '[]') as string[],
            consumptions: Array.isArray(row.consumptions) ? row.consumptions : JSON.parse(row.consumptions || '[]') as Consumption[],
        };
    }
    return null;
}

export async function updateCulture(id: string, culture: Omit<Culture, 'id'>): Promise<void> {
    const { category, name, sampleType, price, precautions, comments, consumptions } = culture;
    const query = 'UPDATE cultures SET category = ?, name = ?, sampleType = ?, price = ?, precautions = ?, comments = ?, consumptions = ? WHERE id = ?';
    await executeQuery(query, [category, name, sampleType, price, precautions, JSON.stringify(comments), JSON.stringify(consumptions), id]);
}


export async function deleteCulture(id: string): Promise<void> {
  const query = 'DELETE FROM cultures WHERE id = ?';
  await executeQuery(query, [id]);
}
