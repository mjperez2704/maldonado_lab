'use server';
import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/db';
import {connection} from "next/server";

// =================================================================
// INTERFACES NORMALIZADAS
// =================================================================

// Representa un registro en la tabla `recibos`
export interface Recibo {
    id: number;
    patient_id: number;
    doctor_id: number | null;
    branch_id: number;
    created_by_id: number;
    date: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    due: number;
    status: 'pending' | 'in_process' | 'completed' | 'delivered' | 'cancelled';
}

// Representa un registro en la tabla `recibo_details`
export interface ReciboDetail {
    id: number;
    recibo_id: number;
    item_type: 'SERVICE' | 'PRODUCT';
    item_id: number;
    price: number;
    quantity: number;
}

// Representa un registro en la tabla `recibo_results`
export interface ReciboResult {
    id?: number;
    recibo_detail_id: number;
    parameter_id: number;
    result: string;
    validated_by_id: number | null;
    validated_at: string | null;
}

// Vista completa para el frontend
export interface ReciboView extends Recibo {
    patient_name: string;
    doctor_name: string | null;
    branch_name: string;
    created_by_name: string;
    details: (ReciboDetail & { item_name: string, parameters?: any[] })[];
}

// =================================================================
// FUNCIONES DEL SERVICIO
// =================================================================

/**
 * Obtiene una lista de todos los recibos con nombres de relaciones.
 */
export async function getRecibos(): Promise<Omit<ReciboView, 'details'>[]> {
    try {
        const query = `
            SELECT 
                r.*, 
                p.name as patient_name,
                d.name as doctor_name,
                b.name as branch_name,
                e.name as created_by_name
            FROM recibos r
            JOIN patients p ON r.patient_id = p.id
            LEFT JOIN doctors d ON r.doctor_id = d.id
            JOIN branches b ON r.branch_id = b.id
            JOIN employees e ON r.created_by_id = e.id
            ORDER BY r.date DESC
        `;
        const results = await executeQuery(query, []);
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

/**
 * Obtiene los detalles completos de un único recibo.
 */
export async function getReciboById(id: number): Promise<ReciboView | null> {
    const reciboQuery = `
        SELECT r.*, p.name as patient_name, d.name as doctor_name, b.name as branch_name, e.name as created_by_name
        FROM recibos r
        JOIN patients p ON r.patient_id = p.id
        LEFT JOIN doctors d ON r.doctor_id = d.id
        JOIN branches b ON r.branch_id = b.id
        JOIN employees e ON r.created_by_id = e.id
        WHERE r.id = ?
    `;
    const detailsQuery = `
        SELECT rd.*, s.name as item_name 
        FROM recibo_details rd
        JOIN services s ON rd.item_id = s.id AND rd.item_type = 'SERVICE'
        WHERE rd.recibo_id = ?
    `;

    try {
        const reciboResult = await executeQuery<any[]>(reciboQuery, [id]);
        if (reciboResult.length === 0) return null;

        const detailsResult = await executeQuery<(ReciboDetail & { item_name: string })[]>(detailsQuery, [id]);

        // Para cada detalle, obtener sus parámetros y resultados si existen
        for (const detail of detailsResult) {
            const parametersQuery = `SELECT * FROM service_parameters WHERE service_id = ?`;
            const resultsQuery = `SELECT * FROM recibo_results WHERE recibo_detail_id = ?`;
            const [parameters, results] = await Promise.all([
                executeQuery<any[]>(parametersQuery, [detail.item_id]),
                executeQuery<ReciboResult[]>(resultsQuery, [detail.id])
            ]);

            // Mapear resultados a los parámetros
            detail.parameters = parameters.map(p => ({
                ...p,
                result: results.find(r => r.parameter_id === p.id)?.result || ''
            }));
        }

        return {
            ...reciboResult[0],
            details: detailsResult,
        };
    } catch (error) {
        console.error("Error fetching recibo details:", error);
        return null;
    }
}

/**
 * Crea un nuevo recibo y sus detalles dentro de una transacción.
 */
export async function createRecibo(data: Omit<Recibo, 'id' | 'date' | 'due' | 'status'> & { details: Omit<ReciboDetail, 'id' | 'recibo_id'>[] }): Promise<number> {
    const connection = await beginTransaction();
    try {
        const { patient_id, doctor_id, branch_id, created_by_id, subtotal, discount, total, paid, details } = data;

        const reciboQuery = `
            INSERT INTO recibos (patient_id, doctor_id, branch_id, created_by_id, date, subtotal, discount, total, paid, status)
            VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, 'pending')
        `;
        const reciboResult = await executeQuery(reciboQuery, [patient_id, doctor_id, branch_id, created_by_id, subtotal, discount, total, paid]) as any;
        const newReciboId = reciboResult.insertId;

        if (details && details.length > 0) {
            const detailQuery = 'INSERT INTO recibo_details (recibo_id, item_type, item_id, price, quantity) VALUES ?';
            const detailValues = details.map(d => [newReciboId, d.item_type, d.item_id, d.price, d.quantity]);
            await executeQuery(detailQuery, [detailValues]);
        }

        await commitTransaction(connection);
        return newReciboId;
    } catch (error) {
        await rollbackTransaction(connection);
        console.error("Failed to create recibo:", error);
        throw error;
    }
}

/**
 * Guarda los resultados de un recibo y actualiza su estado.
 */
export async function saveResults(reciboId: number, results: Omit<ReciboResult, 'id' | 'validated_at' | 'validated_by_id'>[]): Promise<void> {
    const connection = await beginTransaction();
    try {
        // Borrar resultados anteriores para este recibo para evitar duplicados
        const detailIdsQuery = 'SELECT id FROM recibo_details WHERE recibo_id = ?';
        const detailIdsResult = await executeQuery<{id: number}[]>(detailIdsQuery, [reciboId]);
        const detailIds = detailIdsResult.map(r => r.id);

        if(detailIds.length > 0) {
            await executeQuery('DELETE FROM recibo_results WHERE recibo_detail_id IN (?)', [detailIds]);
        }

        // Insertar los nuevos resultados
        if (results && results.length > 0) {
            const resultsQuery = 'INSERT INTO recibo_results (recibo_detail_id, parameter_id, result) VALUES ?';
            const resultValues = results.map(r => [r.recibo_detail_id, r.parameter_id, r.result]);
            await executeQuery(resultsQuery, [resultValues]);
        }

        // Actualizar el estado del recibo
        const updateStatusQuery = 'UPDATE recibos SET status = ? WHERE id = ?';
        await executeQuery(updateStatusQuery, ['completed', reciboId]);

        await commitTransaction(connection);
    } catch (error) {
        await rollbackTransaction(connection);
        console.error("Failed to save results:", error);
        throw error;
    }
}
