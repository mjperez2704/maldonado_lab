"use server";
import { executeQuery } from '@/lib/db';

export interface Producto {
  id: number;
  nombre: string;
  sku: string;
  sucursal_id: string;
  categoria_id: string;
  unidad_id: string;
  precio_compra: number;
  precio_venta: number;
  stockInicial: number;
  alertaStock: number;
  fechaCaducidad?: string;
  diasAlertaCaducidad: number;
  alertaCaducidadActiva: boolean;
}

export async function getProducts(): Promise<Producto[]> {
    try {
        const results = await executeQuery('SELECT * FROM productos');
        return results as Producto[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createProduct(product: Omit<Producto, 'id'>): Promise<void> {
    const { nombre, sku, sucursal_id, categoria_id, unidad_id, precio_compra, precio_venta, stockInicial, alertaStock, fechaCaducidad, diasAlertaCaducidad, alertaCaducidadActiva } = product;
    const query = 'INSERT INTO productos (nombre, sku, sucursal_id, categoria_id, unidad_id, precio_compra, precio_venta, stcokInicial, alertaStock, fechaCaducidad, diasAlertaCaducidad, alertaCaducidadActiva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [nombre, sku, sucursal_id, categoria_id, unidad_id, precio_compra, precio_venta, stockInicial, alertaStock, fechaCaducidad || null, diasAlertaCaducidad, alertaCaducidadActiva]);
}

export async function getProductById(id: number): Promise<Producto | null> {
    const results = await executeQuery<Producto[]>('SELECT * FROM productos WHERE id = ?', [id]);
    return results.length > 0 ? results[0] as Producto : null;
}

export async function updateProduct(id: number, product: Partial<Omit<Producto, 'id'>>): Promise<void> {
    const { nombre, sku, sucursal_id, categoria_id, unidad_id, precio_compra, precio_venta, stockInicial, alertaStock, fechaCaducidad, diasAlertaCaducidad, alertaCaducidadActiva } = product;
    const query = 'UPDATE productos SET nombre = ?, sku = ?, sucursal_id = ?, categoria_id = ?, unidad_id = ?, precio_compra = ?, precio_venta = ?, stcokInicial = ?, alertaStock = ?, fechaCaducidad = ?, diasAlertaCaducidad = ?, alertaCaducidadActiva = ? WHERE id = ?';
    await executeQuery(query, [nombre, sku, sucursal_id, categoria_id, unidad_id, precio_compra, precio_venta, stockInicial, alertaStock, fechaCaducidad || null, diasAlertaCaducidad, alertaCaducidadActiva, id]);
}


export async function deleteProduct(id: number): Promise<void> {
  const query = 'DELETE FROM productos WHERE id = ?';
  await executeQuery(query, [id]);
}
