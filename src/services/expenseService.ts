'use server';
import { executeQuery } from '@/lib/db';

export interface Expense {
  id: number;
  fecha: string;
  categoria_gasto_id: number;
  monto: number;
  metodo_pago_id: number;
  notas: string;
}

export async function getExpenses(): Promise<Expense[]> {
    try {
        const results = await executeQuery('SELECT * FROM gastos');
        return JSON.parse(JSON.stringify(results)) as Expense[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    const { fecha, categoria_gasto_id, monto, metodo_pago_id, notas } = expense;
    const query = 'INSERT INTO gastos (fecha, categoria_gasto_id, monto, metodo_pago_id, notas) VALUES (?, ?, ?, ?, ?)';
    await executeQuery(query, [fecha, categoria_gasto_id, monto, metodo_pago_id, notas]);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
    const results = await executeQuery<Expense[]>('SELECT * FROM gastos WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Expense;
    }
    return null;
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): Promise<void> {
    const { fecha, categoria_gasto_id, monto, metodo_pago_id, notas } = expense;
    const query = 'UPDATE gastos SET fecha = ?, categoria_gasto_id = ?, monto = ?, metodo_pago_id = ?, notas = ? WHERE id = ?';
    await executeQuery(query, [fecha, categoria_gasto_id, monto, metodo_pago_id, notas, id]);
}


export async function deleteExpense(id: string): Promise<void> {
  const query = 'DELETE FROM gastos WHERE id = ?';
  await executeQuery(query, [id]);
}
