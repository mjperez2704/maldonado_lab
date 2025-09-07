"use server";
import { executeQuery } from '@/lib/db';



export interface Patient {
  id: number;
  name: string;
  nationality: string;
  ine: string;
  curp?: string;
  email?: string;
  phone?: string;
  gender: string;
  birthDate: string;
  age: number;
  ageUnit: 'anos' | 'meses' | 'dias';
  address?: string;
  convenio?: string;
  avatarUrl?: string;
}

export async function getPatients(): Promise<Patient[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM patients');
        // Purificamos los resultados para Next.js
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    const { name, nationality, ine, curp, email, phone, gender, birthDate, age, ageUnit, address, convenio, avatarUrl } = patient;
    const query = 'INSERT INTO patients (name, nationality, ine, curp, email, phone, gender, birthDate, age, ageUnit, address, convenio, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, nationality, ine, curp, email, phone, gender, birthDate, age, ageUnit, address, convenio, avatarUrl]);
}

export async function getPatientById(id: number): Promise<Patient | null> {
    const results = await executeQuery<Patient[]>('SELECT * FROM patients WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

export async function updatePatient(id: number, patient: Omit<Patient, "id">): Promise<void> {
    const { name, nationality, ine, curp, email, phone, gender, birthDate, age, ageUnit, address, convenio, avatarUrl } = patient;
    const query = 'UPDATE patients SET name = ?, nationality = ?, ine = ?, curp = ?, email = ?, phone = ?, gender = ?, birthDate = ?, age = ?, ageUnit = ?, address = ?, convenio = ?, avatarUrl = ? WHERE id = ?';
    await executeQuery(query, [name, nationality, ine, curp, email, phone, gender, birthDate, age, ageUnit, address, convenio, avatarUrl, id]);
}


export async function deletePatient(id: number): Promise<void> {
  const query = 'DELETE FROM patients WHERE id = ?';
  await executeQuery(query, [id]);
}
