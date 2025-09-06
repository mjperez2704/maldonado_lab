'use server';
import { executeQuery } from '@/lib/db';

// Interfaz actualizada para reflejar el schema de la BD
export interface Expense {
  id: number;
  branch_id: number;
  category_id: number;
  date: string;
  amount: number;
  notes: string | null;
}

// Vista para la tabla, incluye los nombres de las relaciones
export interface ExpenseView extends Expense {
    branch_name: string;
    category_name: string;
}

// getExpenses ahora une las tablas para obtener los nombres
export async function getExpenses(): Promise<ExpenseView[]> {
    try {
        const query = `
            SELECT 
                e.*, 
                b.name as branch_name,
                ec.name as category_name
            FROM expenses e
            JOIN branches b ON e.branch_id = b.id
            JOIN expense_categories ec ON e.category_id = ec.id
            ORDER BY e.date DESC
        `;
        const results = await executeQuery(query);
        return JSON.parse(JSON.stringify(results)) as ExpenseView[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createExpense ahora usa los IDs correctos
export async function createExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    const { branch_id, category_id, date, amount, notes } = expense;
    const query = 'INSERT INTO expenses (branch_id, category_id, date, amount, notes) VALUES (?, ?, ?, ?, ?)';
    await executeQuery(query, [branch_id, category_id, date, amount, notes]);
}

// getExpenseById ahora selecciona solo las columnas existentes
export async function getExpenseById(id: number): Promise<Expense | null> {
    const query = 'SELECT id, branch_id, category_id, date, amount, notes FROM expenses WHERE id = ?';
    const results = await executeQuery<Expense[]>(query, [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

// updateExpense ahora usa los IDs correctos
export async function updateExpense(id: number, expense: Partial<Omit<Expense, 'id'>>): Promise<void> {
    const { branch_id, category_id, date, amount, notes } = expense;
    const query = 'UPDATE expenses SET branch_id = ?, category_id = ?, date = ?, amount = ?, notes = ? WHERE id = ?';
    await executeQuery(query, [branch_id, category_id, date, amount, notes, id]);
}

export async function deleteExpense(id: number): Promise<void> {
  const query = 'DELETE FROM expenses WHERE id = ?';
  await executeQuery(query, [id]);
}
