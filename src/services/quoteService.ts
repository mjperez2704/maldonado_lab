'use server';
import { executeQuery } from '@/lib/db';

export interface Quote {
    id: number;
    patientId: string;
    patientName: string;
    date: string;
    subtotal: number;
    discount: number;
    total: number;
    studies: string[];
    packages: string[];
    status: 'pending' | 'converted';
}

export type QuoteCreation = Omit<Quote, 'id' | 'date' | 'status'>;

export async function getQuotes(): Promise<Quote[]> {
    try {
        // 1. Obtenemos los resultados como un tipo genérico 'any[]'
        const results = await executeQuery<any[]>('SELECT * FROM quotes ORDER BY date DESC');
        // 2. Mapeamos cada resultado, transformando los campos JSON string a arrays
        return results.map((q) => ({
            ...q,
            studies: JSON.parse(q.studies || '[]'),
            packages: JSON.parse(q.packages || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createQuote(quote: QuoteCreation): Promise<void> {
    const date = new Date().toISOString();
    const status = 'pending';
    const { patientId, patientName, subtotal, discount, total, studies, packages } = quote;
    const query = 'INSERT INTO quotes (patientId, patientName, date, subtotal, discount, total, studies, packages, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [patientId, patientName, date, subtotal, discount, total, JSON.stringify(studies), JSON.stringify(packages), status]);
}

export async function getQuoteById(id: string): Promise<Quote | null> {
    // 1. Obtenemos el resultado como un tipo genérico 'any[]'
    const results = await executeQuery<any[]>('SELECT * FROM quotes WHERE id = ?', [id]);
    if (results.length > 0) {
        const row = results[0];
        // 2. Transformamos el resultado individual
        return {
            ...row,
            studies: JSON.parse(row.studies || '[]'),
            packages: JSON.parse(row.packages || '[]'),
        };
    }
    return null;
}

export async function updateQuote(id: string, quote: Partial<Omit<Quote, 'id' | 'date' | 'patientId' | 'patientName'>>): Promise<void> {
    const { subtotal, discount, total, studies, packages, status } = quote;

    const fields: string[] = [];
    const values: any[] = [];

    if (subtotal !== undefined) { fields.push('subtotal = ?'); values.push(subtotal); }
    if (discount !== undefined) { fields.push('discount = ?'); values.push(discount); }
    if (total !== undefined) { fields.push('total = ?'); values.push(total); }
    if (studies !== undefined) { fields.push('studies = ?'); values.push(JSON.stringify(studies)); }
    if (packages !== undefined) { fields.push('packages = ?'); values.push(JSON.stringify(packages)); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) return;

    const query = `UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await executeQuery(query, values);
}

export async function deleteQuote(id: string): Promise<void> {
    const query = 'DELETE FROM quotes WHERE id = ?';
    await executeQuery(query, [id]);
}
