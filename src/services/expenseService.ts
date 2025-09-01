'use server';
import { executeQuery } from '@/lib/db';

export interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

export async function getExpenses(): Promise<Expense[]> {
    try {
        const results = await executeQuery('SELECT * FROM expenses');
        return JSON.parse(JSON.stringify(results)) as Expense[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    const { date, category, amount, paymentMethod, notes } = expense;
    const query = 'INSERT INTO expenses (date, category, amount, paymentMethod, notes) VALUES (?, ?, ?, ?, ?)';
    await executeQuery(query, [date, category, amount, paymentMethod, notes]);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
    const results = await executeQuery<Expense[]>('SELECT * FROM expenses WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Expense;
    }
    return null;
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): Promise<void> {
    const { date, category, amount, paymentMethod, notes } = expense;
    const query = 'UPDATE expenses SET date = ?, category = ?, amount = ?, paymentMethod = ?, notes = ? WHERE id = ?';
    await executeQuery(query, [date, category, amount, paymentMethod, notes, id]);
}


export async function deleteExpense(id: string): Promise<void> {
  const query = 'DELETE FROM expenses WHERE id = ?';
  await executeQuery(query, [id]);
}
