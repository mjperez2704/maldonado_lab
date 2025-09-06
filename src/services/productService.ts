"use server";
import { executeQuery } from '@/lib/db';

// Interfaz actualizada para reflejar el schema de la BD
export interface Product {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  type: 'ANTIBIOTICO' | 'CONSUMIBLE' | 'PRUEBA_RAPIDA' | 'OTRO';
  unit: string | null;
  price: number;
  cost: number | null;
  stock: number;
  stock_alert: number;
}

// getProducts ahora selecciona solo las columnas existentes.
export async function getProducts(): Promise<Product[]> {
    try {
        const query = 'SELECT id, name, sku, description, type, unit, price, cost, stock, stock_alert FROM products';
        const results = await executeQuery(query);
        return JSON.parse(JSON.stringify(results)) as Product[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createProduct ahora usa solo los campos correctos.
export async function createProduct(product: Omit<Product, 'id'>): Promise<void> {
    const { name, sku, description, type, unit, price, cost, stock, stock_alert } = product;
    const query = 'INSERT INTO products (name, sku, description, type, unit, price, cost, stock, stock_alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, sku, description, type, unit, price, cost, stock, stock_alert]);
}

// getProductById ahora selecciona solo las columnas existentes.
export async function getProductById(id: number): Promise<Product | null> {
    const query = 'SELECT id, name, sku, description, type, unit, price, cost, stock, stock_alert FROM products WHERE id = ?';
    const results = await executeQuery<Product[]>(query, [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

// updateProduct ahora usa solo los campos correctos.
export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<void> {
    const { name, sku, description, type, unit, price, cost, stock, stock_alert } = product;
    const query = `
        UPDATE products SET 
            name = ?, sku = ?, description = ?, type = ?, unit = ?, 
            price = ?, cost = ?, stock = ?, stock_alert = ?
        WHERE id = ?
    `;
    await executeQuery(query, [name, sku, description, type, unit, price, cost, stock, stock_alert, id]);
}

export async function deleteProduct(id: number): Promise<void> {
  const query = 'DELETE FROM products WHERE id = ?';
  await executeQuery(query, [id]);
}
