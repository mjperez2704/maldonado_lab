'use server';
import { executeQuery } from '@/lib/db';

export interface Quote {
    id: number;
    paciente_id: string;
    paciente_nombre: string;
    fecha: string;
    subtotal: number;
    descuento: number;
    total: number;
    estudios: string[];
    paquetes: string[];
    estado: 'generada' | 'enviada' | 'aprovada' | 'rechazada' | 'convertida' ;
}

export type QuoteCreation = Omit<Quote, 'id' | 'fecha' | 'estado'>;

export async function getQuotes(): Promise<Quote[]> {
    try {
        // 1. Obtenemos los resultados como un tipo genérico 'any[]'
        const results = await executeQuery<any[]>('SELECT * FROM cotizaciones ORDER BY fecha DESC');
        // 2. Mapeamos cada resultado, transformando los campos JSON string a arrays
        return results.map((q) => ({
            ...q,
            estudios: JSON.parse(q.estudios || '[]'),
            paquetes: JSON.parse(q.paquetes || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createQuote(cotizacion: QuoteCreation): Promise<void> {
    const fecha = new Date().toISOString();
    const estado = 'pending';
    const { paciente_id, subtotal, descuento, total, estudios, paquetes } = cotizacion;
    const query = 'INSERT INTO cotizaciones (paciente_id, , fecha, subtotal, descuento, total, estudios, paquetes, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [paciente_id, , fecha, subtotal, descuento, total, JSON.stringify(estudios), JSON.stringify(paquetes), estado]);
}

export async function getQuoteById(id: string): Promise<Quote | null> {
    // 1. Obtenemos el resultado como un tipo genérico 'any[]'
    const results = await executeQuery<any[]>('SELECT * FROM cotizaciones WHERE id = ?', [id]);
    if (results.length > 0) {
        const row = results[0];
        // 2. Transformamos el resultado individual
        return {
            ...row,
            estudios: JSON.parse(row.estudios || '[]'),
            paquetes: JSON.parse(row.paquetes || '[]'),
        };
    }
    return null;
}

export async function updateQuote(id: string, cotizacion: Partial<Omit<Quote, 'id' | 'fecha' | 'paciente_id' | ''>>): Promise<void> {
    const { subtotal, descuento, total, estudios, paquetes, estado } = cotizacion;

    const fields: string[] = [];
    const values: any[] = [];

    if (subtotal !== undefined) { fields.push('subtotal = ?'); values.push(subtotal); }
    if (descuento !== undefined) { fields.push('descuento = ?'); values.push(descuento); }
    if (total !== undefined) { fields.push('total = ?'); values.push(total); }
    if (estudios !== undefined) { fields.push('estudios = ?'); values.push(JSON.stringify(estudios)); }
    if (paquetes !== undefined) { fields.push('paquetes = ?'); values.push(JSON.stringify(paquetes)); }
    if (estado !== undefined) { fields.push('estado = ?'); values.push(estado); }

    if (fields.length === 0) return;

    const query = `UPDATE cotizaciones SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await executeQuery(query, values);
}

export async function deleteQuote(id: string): Promise<void> {
    const query = 'DELETE FROM cotizaciones WHERE id = ?';
    await executeQuery(query, [id]);
}
