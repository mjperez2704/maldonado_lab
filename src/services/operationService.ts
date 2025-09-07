'use server';
import { executeQuery } from '@/lib/db';

export interface Operation {
  id: number;
  date: string;
  concept: string;
  employee: string;
  amount: number;
  paymentMethod: string;
  type: 'ingress' | 'egress';
}

export async function getOperations(): Promise<Operation[]> {
    try {
        const results = await executeQuery('SELECT * FROM operations ORDER BY date DESC');
        return JSON.parse(JSON.stringify(results)) as Operation[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createOperation(operation: Omit<Operation, 'id'>): Promise<void> {
    const { date, concept, employee, amount, paymentMethod, type } = operation;
    const query = 'INSERT INTO operations (date, concept, employee, amount, paymentMethod, type) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [date, concept, employee, amount, paymentMethod, type]);
}


export async function deleteOperation(id: string): Promise<void> {
  const query = 'DELETE FROM operations WHERE id = ?';
  await executeQuery(query, [id]);
}
