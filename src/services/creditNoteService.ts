'use server';
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface CreditNote {
  id: number;
  branch: string;
  date: string;
  patient: string;
  amount: number;
  reason: string;
  status: 'active' | 'cancelled';
}

export async function getCreditNotes(): Promise<CreditNote[]> {
    try {
        const results = await executeQuery<CreditNote[]>('SELECT * FROM credit_notes ORDER BY date DESC', []);
        return JSON.parse(JSON.stringify(results)) as CreditNote[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createCreditNote(note: Omit<CreditNote, 'id' | 'status'>): Promise<void> {
    const { branch, date, patient, amount, reason } = note;
    const query = 'INSERT INTO credit_notes (branch, date, patient, amount, reason, status) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [branch, date, patient, amount, reason, 'active']);
}

export async function getCreditNoteById(id: string): Promise<CreditNote | null> {
    const results = await executeQuery<CreditNote[]>('SELECT * FROM credit_notes WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as CreditNote;
    }
    return null;
}

export async function updateCreditNote(id: string, note: Partial<Omit<CreditNote, 'id'>>): Promise<void> {
    const { branch, date, patient, amount, reason, status } = note;
    const query = 'UPDATE credit_notes SET branch = ?, date = ?, patient = ?, amount = ?, reason = ?, status = ? WHERE id = ?';
    await executeQuery(query, [branch, date, patient, amount, reason, status, id]);
}

export async function deleteCreditNote(id: string): Promise<void> {
  const query = 'DELETE FROM credit_notes WHERE id = ?';
  await executeQuery(query, [id]);
}
