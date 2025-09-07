'use server';
import { executeQuery } from '@/lib/db';

interface PurchaseProduct {
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

interface PurchasePayment {
    date: string;
    amount: number;
    method: string;
}

export interface Purchase {
  id: number;
  date: string;
  branch: string;
  provider: string;
  notes: string;
  products: PurchaseProduct[];
  payments: PurchasePayment[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
}

export async function getPurchases(): Promise<Purchase[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM purchases');
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((row: any) => ({
            ...row,
            products: JSON.parse(row.products || '[]'),
            payments: JSON.parse(row.payments || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createPurchase(purchase: Omit<Purchase, 'id'>): Promise<void> {
    const { date, branch, provider, notes, products, payments, subtotal, tax, total, paid, due } = purchase;
    const query = 'INSERT INTO purchases (date, branch, provider, notes, products, payments, subtotal, tax, total, paid, due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [date, branch, provider, notes, JSON.stringify(products), JSON.stringify(payments), subtotal, tax, total, paid, due]);
}

export async function getPurchaseById(id: string): Promise<Purchase | null> {
    const results = await executeQuery<any[]>('SELECT * FROM purchases WHERE id = ?', [id]);
     if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            products: JSON.parse(row.products || '[]'),
            payments: JSON.parse(row.payments || '[]'),
        };
    }
    return null;
}

export async function updatePurchase(id: string, purchase: Omit<Purchase, 'id'>): Promise<void> {
    const { date, branch, provider, notes, products, payments, subtotal, tax, total, paid, due } = purchase;
    const query = 'UPDATE purchases SET date = ?, branch = ?, provider = ?, notes = ?, products = ?, payments = ?, subtotal = ?, tax = ?, total = ?, paid = ?, due = ? WHERE id = ?';
    await executeQuery(query, [date, branch, provider, notes, JSON.stringify(products), JSON.stringify(payments), subtotal, tax, total, paid, due, id]);
}


export async function deletePurchase(id: string): Promise<void> {
  const query = 'DELETE FROM purchases WHERE id = ?';
  await executeQuery(query, [id]);
}
