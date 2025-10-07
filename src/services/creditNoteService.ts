'use server';
import { executeQuery } from '@/lib/db';

export interface CreditNote {
  id: number;
  sucursal_id: number;
  fecha: string;
  paciente_id: string;
  monto: number;
  razon: string;
  estatus: 'activo' | 'cancelado';
}

export async function getCreditNotes(): Promise<CreditNote[]> {
    try {
        const results = await executeQuery<CreditNote[]>('SELECT * FROM notas_credito ORDER BY fecha DESC');
        return JSON.parse(JSON.stringify(results)) as CreditNote[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createCreditNote(note: Omit<CreditNote, 'id' | 'estatus'>): Promise<void> {
    const { sucursal_id, fecha, paciente_id, monto, razon } = note;
    const query = 'INSERT INTO notes_credito (sucursal_id, fecha, paciente_id, monto, razon, estado) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [sucursal_id, fecha, paciente_id, monto, razon, 'active']);
}

export async function getCreditNoteById(id: string): Promise<CreditNote | null> {
    const results = await executeQuery<CreditNote[]>('SELECT * FROM credit_notes WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as CreditNote;
    }
    return null;
}

export async function updateCreditNote(id: string, note: Partial<Omit<CreditNote, 'id'>>): Promise<void> {
    const { sucursal_id, fecha, paciente_id, monto, razon, estatus } = note;
    const query = 'UPDATE credit_notes SET branch = ?, date = ?, patient = ?, amount = ?, reason = ?, status = ? WHERE id = ?';
    await executeQuery(query, [sucursal_id, fecha, paciente_id, monto, razon, estatus, id]);
}

export async function deleteCreditNote(id: string): Promise<void> {
  const query = 'DELETE FROM credit_notes WHERE id = ?';
  await executeQuery(query, [id]);
}
