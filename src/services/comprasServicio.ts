'use server';
import { executeQuery } from '@/lib/db';

interface CompraProducto {
    nombre: string;
    precio: number;
    cantidad: number;
    totalPrice: number;
}

interface CompraPago {
    fecha: string;
    monto: number;
    metodo: string;
}

export interface Compras {
  id: number;
  fecha: string;
  sucursal_id: number;
  proveedor_id: number;
  notas: string;
  productos: CompraProducto[];
  pagos: CompraPago[];
  subtotal: number;
  impuesto: number; // Renombrado de impuesto
  total: number;
  pagado: number;
  adeudo: number;
}

export async function getCompras(): Promise<Compras[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM compras');
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((row: any) => ({
            ...row,
            productos: JSON.parse(row.productos || '[]'),
            pagos: JSON.parse(row.pagos || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createPurchase(purchase: Omit<Compras, 'id'>): Promise<void> {
    const { fecha, sucursal_id, proveedor_id, notas, productos, pagos, subtotal, impuesto, total, pagado, adeudo } = purchase;
    const query = 'INSERT INTO compras (fecha, sucursal_id, proveedor_id, notas, productos, pagos, subtotal, impuesto, total, pagado, adeudo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [fecha, sucursal_id, proveedor_id, notas, JSON.stringify(productos), JSON.stringify(pagos), subtotal, impuesto, total, pagado, adeudo]);
}

export async function getPurchaseById(id: string): Promise<Compras | null> {
    const results = await executeQuery<any[]>('SELECT * FROM compras WHERE id = ?', [id]);
     if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            productos: JSON.parse(row.productos || '[]'),
            pagos: JSON.parse(row.pagos || '[]'),
        };
    }
    return null;
}

export async function updatePurchase(id: string, purchase: Omit<Compras, 'id'>): Promise<void> {
    const { fecha, sucursal_id, proveedor_id, notas, productos, pagos, subtotal, impuesto, total, pagado, adeudo } = purchase;
    const query = 'UPDATE compras SET fecha = ?, sucursal_id = ?, provider = ?, notas = ?, productos = ?, pagos = ?, subtotal = ?, impuesto = ?, total = ?, pagado = ?, adeudo = ? WHERE id = ?';
    await executeQuery(query, [fecha, sucursal_id, proveedor_id, notas, JSON.stringify(productos), JSON.stringify(pagos), subtotal, impuesto, total, pagado, adeudo, id]);
}


export async function deletePurchase(id: string): Promise<void> {
  const query = 'DELETE FROM compras WHERE id = ?';
  await executeQuery(query, [id]);
}
