'use server';

import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/db';
import {connection} from "next/server";

// =================================================================
// INTERFACES NORMALIZADAS
// =================================================================

// Representa un registro en la tabla `quotes`
export interface Quote {
    id: number;
    patient_id: number;
    created_by_id: number;
    date: string;
    total: number | null;
    status: 'pending' | 'converted' | 'rejected';
}

// Representa un registro en la tabla `quote_details`
export interface QuoteDetail {
    id?: number;
    quote_id?: number;
    item_type: 'SERVICE' | 'PRODUCT';
    item_id: number;
    price: number;
    quantity: number;
}

// Vista completa para el frontend, incluyendo detalles y nombres
export interface QuoteDetailsView extends Quote {
    patient_name: string;
    details: (QuoteDetail & { item_name: string })[];
}

// =================================================================
// FUNCIONES DEL SERVICIO
// =================================================================

/**
 * Obtiene una lista de todas las cotizaciones con el nombre del paciente.
 */
export async function getQuotes(): Promise<(Quote & { patient_name: string })[]> {
    try {
        const query = `
            SELECT q.*, p.name as patient_name
            FROM quotes q
            JOIN patients p ON q.patient_id = p.id
            ORDER BY q.date DESC
        `;
        const results = await executeQuery(query, []);
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

/**
 * Obtiene los detalles completos de una única cotización.
 */
export async function getQuoteById(id: number): Promise<QuoteDetailsView | null> {
    const quoteQuery = `
        SELECT q.*, p.name as patient_name
        FROM quotes q
        JOIN patients p ON q.patient_id = p.id
        WHERE q.id = ?
    `;
    const detailsQuery = `
        SELECT 
            qd.*, 
            s.name as item_name 
        FROM quote_details qd
        JOIN services s ON qd.item_id = s.id AND qd.item_type = 'SERVICE'
        WHERE qd.quote_id = ?
    `; // Nota: Esta consulta solo une con 'services'. Se necesitaría una UNION ALL para unir con 'products'.

    try {
        const quoteResult = await executeQuery<any[]>(quoteQuery, [id]);
        if (quoteResult.length === 0) return null;

        const detailsResult = await executeQuery<any[]>(detailsQuery, [id]);

        return {
            ...quoteResult[0],
            details: detailsResult,
        };
    } catch (error) {
        console.error("Error fetching quote details:", error);
        return null;
    }
}

/**
 * Crea una nueva cotización y sus detalles dentro de una transacción.
 */
export async function createQuote(data: { patient_id: number; created_by_id: number; total: number; details: Omit<QuoteDetail, 'id' | 'quote_id'>[] }): Promise<number> {
    const connection = await beginTransaction();
    try {
        // 1. Insertar la cotización principal
        const quoteQuery = `
            INSERT INTO quotes (patient_id, created_by_id, date, total, status)
            VALUES (?, ?, NOW(), ?, 'pending')
        `;
        const quoteResult = await executeQuery(quoteQuery, [data.patient_id, data.created_by_id, data.total]) as any;
        const newQuoteId = quoteResult.insertId;

        // 2. Insertar los detalles
        if (data.details && data.details.length > 0) {
            const detailQuery = 'INSERT INTO quote_details (quote_id, item_type, item_id, price, quantity) VALUES ?';
            const detailValues = data.details.map(d => [newQuoteId, d.item_type, d.item_id, d.price, d.quantity]);
            await executeQuery(detailQuery, [detailValues]);
        }

        await commitTransaction(connection);
        return newQuoteId;
    } catch (error) {
        await rollbackTransaction(connection);
        console.error("Failed to create quote:", error);
        throw error;
    }
}

/**
 * Actualiza el estado de una cotización (ej. a 'converted').
 */
export async function updateQuoteStatus(id: number, status: 'converted' | 'rejected'): Promise<void> {
    const query = 'UPDATE quotes SET status = ? WHERE id = ?';
    await executeQuery(query, [status, id]);
}


/**
 * Elimina una cotización. La BD se encarga de los detalles en cascada.
 */
export async function deleteQuote(id: number): Promise<void> {
    const query = 'DELETE FROM quotes WHERE id = ?';
    await executeQuery(query, [id]);
}
