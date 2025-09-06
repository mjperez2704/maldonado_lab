'use server';
import { executeQuery } from '@/lib/db';
import mysql from "mysql2/promise";

// Interfaz para la tabla cash_cuts
export interface CashCut {
  id: number;
  branch_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  initial_balance: number;
  final_balance: number;
  calculated_balance: number;
  difference: number;
  notes: string | null;
}

// Por ahora, solo necesitamos una función para crear un nuevo registro de corte de caja.
export async function createCashCut(data: Omit<CashCut, 'id' | 'end_time'>): Promise<void> {
    const {
        branch_id,
        user_id,
        start_time,
        initial_balance,
        final_balance,
        calculated_balance,
        difference,
        notes
    } = data;

    const query = `
        INSERT INTO cash_cuts (branch_id, user_id, start_time, end_time, initial_balance, final_balance, calculated_balance, difference, notes)
        VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
    `;

    const connection = await mysql.createConnection(dbConfig);
    await executeQuery(query, [
        branch_id,
        user_id,
        start_time,
        initial_balance,
        final_balance,
        calculated_balance,
        difference,
        notes
    ]);
    await connection.end();
}
