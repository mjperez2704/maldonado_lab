'use server';
import { executeQuery } from '@/lib/db';

export interface Operation {
  id: number;
  fecha: string;
  concepto: string;
  empleado_id: number;
  monto: number;
  metodo_pago_id: number;
  tipo: 'ingreso' | 'egreso';
}

export async function getOperations(): Promise<Operation[]> {
    try {
        const results = await executeQuery('SELECT * FROM operaciones ORDER BY fecha DESC');
        return JSON.parse(JSON.stringify(results)) as Operation[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createOperation(operation: Omit<Operation, 'id'>): Promise<void> {
    const { fecha, concepto, empleado_id, monto, metodo_pago_id, tipo } = operation;
    const query = 'INSERT INTO operaciones (fecha, concepto, empleado_id, monto, metodo_pago_id, tipo) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [fecha, concepto, empleado_id, monto, metodo_pago_id, tipo]);
}


export async function deleteOperation(id: string): Promise<void> {
  const query = 'DELETE FROM operaciones WHERE id = ?';
  await executeQuery(query, [id]);
}
