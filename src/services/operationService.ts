'use server';
import { executeQuery } from '@/lib/db';

// Interfaz actualizada para reflejar el nuevo schema de la BD
export interface Operation {
  id: number;
  date: string;
  concept: string;
  amount: number;
  type: 'ingress' | 'egress';
  payment_method: string;
  employee_id: number;
  branch_id: number;
}

// Vista para la tabla, incluye los nombres de las relaciones
export interface OperationView extends Operation {
    employee_name: string;
    branch_name: string;
}

// getOperations ahora une las tablas para obtener los nombres
export async function getOperations(): Promise<OperationView[]> {
    try {
        const query = `
            SELECT 
                o.*, 
                e.name as employee_name,
                b.name as branch_name
            FROM operations o
            JOIN employees e ON o.employee_id = e.id
            JOIN branches b ON o.branch_id = b.id
            ORDER BY o.date DESC
        `;
        const results = await executeQuery(query);
        return JSON.parse(JSON.stringify(results)) as OperationView[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createOperation ahora usa los IDs correctos
export async function createOperation(operation: Omit<Operation, 'id'>): Promise<void> {
    const { date, concept, amount, type, payment_method, employee_id, branch_id } = operation;
    const query = 'INSERT INTO operations (date, concept, amount, type, payment_method, employee_id, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [date, concept, amount, type, payment_method, employee_id, branch_id]);
}

export async function deleteOperation(id: number): Promise<void> {
  const query = 'DELETE FROM operations WHERE id = ?';
  await executeQuery(query, [id]);
}
