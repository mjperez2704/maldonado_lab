'use server';
import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/db';

// =================================================================
// INTERFACES NORMALIZADAS
// =================================================================

// Representa un registro en la tabla `purchases`
export interface Purchase {
    id: number;
    provider_id: number;
    branch_id: number;
    date: string;
    total: number;
    paid: number;
    due: number;
}

// Representa un registro en la tabla `purchase_details`
export interface PurchaseDetail {
    id?: number;
    purchase_id?: number;
    product_id: number;
    quantity: number;
    cost: number;
}

// Vista completa para el frontend
export interface PurchaseDetailsView extends Purchase {
    provider_name: string;
    branch_name: string;
    details: (PurchaseDetail & { product_name: string })[];
}

// =================================================================
// FUNCIONES DEL SERVICIO
// =================================================================

/**
 * Obtiene una lista de todas las compras con nombres de relaciones.
 */
export async function getPurchases(): Promise<(Purchase & { provider_name: string, branch_name: string })[]> {
    try {
        const query = `
            SELECT p.*, prov.name as provider_name, b.name as branch_name
            FROM purchases p
            JOIN providers prov ON p.provider_id = prov.id
            JOIN branches b ON p.branch_id = b.id
            ORDER BY p.date DESC
        `;
        const results = await executeQuery(query);
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

/**
 * Obtiene los detalles completos de una única compra.
 */
export async function getPurchaseById(id: number): Promise<PurchaseDetailsView | null> {
    const purchaseQuery = `
        SELECT p.*, prov.name as provider_name, b.name as branch_name
        FROM purchases p
        JOIN providers prov ON p.provider_id = prov.id
        JOIN branches b ON p.branch_id = b.id
        WHERE p.id = ?
    `;
    const detailsQuery = `
        SELECT pd.*, prod.name as product_name 
        FROM purchase_details pd
        JOIN products prod ON pd.product_id = prod.id
        WHERE pd.purchase_id = ?
    `;

    try {
        const purchaseResult = await executeQuery<any[]>(purchaseQuery, [id]);
        if (purchaseResult.length === 0) return null;

        const detailsResult = await executeQuery<any[]>(detailsQuery, [id]);

        return {
            ...purchaseResult[0],
            details: detailsResult,
        };
    } catch (error) {
        console.error("Error fetching purchase details:", error);
        return null;
    }
}

/**
 * Crea una nueva compra, sus detalles y actualiza el stock de productos, todo en una transacción.
 */
export async function createPurchase(data: { provider_id: number; branch_id: number; date: string; total: number; paid: number; details: Omit<PurchaseDetail, 'id' | 'purchase_id'>[] }): Promise<number> {
    const connection = await beginTransaction();
    try {
        const { provider_id, branch_id, date, total, paid, details } = data;

        // 1. Insertar la compra principal
        const purchaseQuery = `
            INSERT INTO purchases (provider_id, branch_id, date, total, paid)
            VALUES (?, ?, ?, ?, ?)
        `;
        const purchaseResult = await executeQuery(purchaseQuery, [provider_id, branch_id, date, total, paid]) as any;
        const newPurchaseId = purchaseResult.insertId;

        // 2. Insertar detalles y actualizar stock
        if (details && details.length > 0) {
            const detailQuery = 'INSERT INTO purchase_details (purchase_id, product_id, quantity, cost) VALUES ?';
            const detailValues = details.map(d => [newPurchaseId, d.product_id, d.quantity, d.cost]);
            await executeQuery(detailQuery, [detailValues]);

            // 3. Actualizar el stock para cada producto comprado
            for (const detail of details) {
                const updateStockQuery = 'UPDATE products SET stock = stock + ? WHERE id = ?';
                await executeQuery(updateStockQuery, [detail.quantity, detail.product_id]);
            }
        }

        await commitTransaction(connection);
        return newPurchaseId;
    } catch (error) {
        await rollbackTransaction(connection);
        console.error("Failed to create purchase:", error);
        throw error;
    }
}

/**
 * Elimina una compra, sus detalles y revierte el impacto en el stock, todo en una transacción.
 */
export async function deletePurchase(id: number): Promise<void> {
    const connection = await beginTransaction();
    try {
        // 1. Obtener los detalles de la compra ANTES de borrarla
        const details = await executeQuery<PurchaseDetail[]>('SELECT * FROM purchase_details WHERE purchase_id = ?', [id]);

        // 2. Revertir el stock para cada producto
        for (const detail of details) {
            const updateStockQuery = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            await executeQuery(updateStockQuery, [detail.quantity, detail.product_id]);
        }

        // 3. Eliminar la compra (ON DELETE CASCADE se encargará de los detalles)
        await executeQuery('DELETE FROM purchases WHERE id = ?', [id]);

        await commitTransaction(connection);
    } catch (error) {
        await rollbackTransaction(connection);
        console.error("Failed to delete purchase:", error);
        throw error;
    }
}
