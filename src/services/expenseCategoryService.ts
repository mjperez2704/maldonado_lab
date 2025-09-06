'use server';
import { executeQuery } from '@/lib/db';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
        const results = await executeQuery('SELECT * FROM expense_categories ORDER BY name ASC');
        return JSON.parse(JSON.stringify(results)) as ExpenseCategory[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createExpenseCategory(name: string): Promise<void> {
  const query = 'INSERT INTO expense_categories (name) VALUES (?)';
  await executeQuery(query, [name]);
}

export async function deleteExpenseCategory(id: number): Promise<void> {
  const query = 'DELETE FROM expense_categories WHERE id = ?';
  await executeQuery(query, [id]);
}
