"use server";
import { executeQuery } from '@/lib/db';

export interface Product {
  id: number;
  name: string;
  sku: string;
  branch: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  initialStock: number;
  stockAlert: number;
  expiryDate?: string;
  expiryAlertDays: number;
  expiryAlertActive: boolean;
}

export async function getProducts(): Promise<Product[]> {
    try {
        const results = await executeQuery('SELECT * FROM products');
        return results as Product[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<void> {
    const { name, sku, branch, category, unit, purchasePrice, salePrice, initialStock, stockAlert, expiryDate, expiryAlertDays, expiryAlertActive } = product;
    const query = 'INSERT INTO products (name, sku, branch, category, unit, purchasePrice, salePrice, initialStock, stockAlert, expiryDate, expiryAlertDays, expiryAlertActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, sku, branch, category, unit, purchasePrice, salePrice, initialStock, stockAlert, expiryDate || null, expiryAlertDays, expiryAlertActive]);
}

export async function getProductById(id: number): Promise<Product | null> {
    const results = await executeQuery<Product[]>('SELECT * FROM products WHERE id = ?', [id]);
    return results.length > 0 ? results[0] as Product : null;
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<void> {
    const { name, sku, branch, category, unit, purchasePrice, salePrice, initialStock, stockAlert, expiryDate, expiryAlertDays, expiryAlertActive } = product;
    const query = 'UPDATE products SET name = ?, sku = ?, branch = ?, category = ?, unit = ?, purchasePrice = ?, salePrice = ?, initialStock = ?, stockAlert = ?, expiryDate = ?, expiryAlertDays = ?, expiryAlertActive = ? WHERE id = ?';
    await executeQuery(query, [name, sku, branch, category, unit, purchasePrice, salePrice, initialStock, stockAlert, expiryDate || null, expiryAlertDays, expiryAlertActive, id]);
}


export async function deleteProduct(id: number): Promise<void> {
  const query = 'DELETE FROM products WHERE id = ?';
  await executeQuery(query, [id]);
}
