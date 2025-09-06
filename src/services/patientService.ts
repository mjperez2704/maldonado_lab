"use server";
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

// Interfaz actualizada para reflejar el schema de la BD simplificado.
// Se eliminaron los campos: nationality, ine, curp, age, ageUnit, convenio, avatarUrl.
export interface Patient {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  gender: 'masculino' | 'femenino' | 'otro' | null;
  birthDate: string | null; // Se mantiene como string para la transferencia de datos, la BD lo maneja como DATE.
  address: string | null;
}

// getPatients ahora selecciona solo las columnas existentes.
export async function getPatients(): Promise<Patient[]> {
    try {
        const results = await executeQuery('SELECT id, name, email, phone, gender, birthDate, address FROM patients', []);
        // Purificamos los resultados para Next.js
        return JSON.parse(JSON.stringify(results)) as Patient[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createPatient ahora usa solo los campos correctos.
export async function createPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    const { name, email, phone, gender, birthDate, address } = patient;
    const query = 'INSERT INTO patients (name, email, phone, gender, birthDate, address) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, email, phone, gender, birthDate, address]);
}

// getPatientById ahora selecciona solo las columnas existentes.
export async function getPatientById(id: number): Promise<Patient | null> {
    const results = await executeQuery<Patient[]>('SELECT id, name, email, phone, gender, birthDate, address FROM patients WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

// updatePatient ahora usa solo los campos correctos.
export async function updatePatient(id: number, patient: Omit<Patient, "id">): Promise<void> {
    const { name, email, phone, gender, birthDate, address } = patient;
    const query = 'UPDATE patients SET name = ?, email = ?, phone = ?, gender = ?, birthDate = ?, address = ? WHERE id = ?';
    await executeQuery(query, [name, email, phone, gender, birthDate, address, id]);
}

export async function deletePatient(id: number): Promise<void> {
  const query = 'DELETE FROM patients WHERE id = ?';
  await executeQuery(query, [id]);
}
