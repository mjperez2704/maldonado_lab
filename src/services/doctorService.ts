'use server';
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

// Interfaz actualizada para reflejar el schema de la BD simplificado.
// Se eliminaron los campos: code, total, paid, due. 'commission' se renombra a 'commission_rate'.
export interface Doctor {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    commission_rate: number;
}

// getDoctors ahora selecciona solo las columnas existentes.
export async function getDoctors(): Promise<Doctor[]> {
    try {
        const results = await executeQuery('SELECT id, name, phone, email, address, commission_rate FROM doctors', []);
        return JSON.parse(JSON.stringify(results)) as Doctor[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createDoctor ahora usa solo los campos correctos.
export async function createDoctor(doctor: Omit<Doctor, 'id'>): Promise<void> {
    const { name, phone, email, address, commission_rate } = doctor;
    const query = 'INSERT INTO doctors (name, phone, email, address, commission_rate) VALUES (?, ?, ?, ?, ?)';
    await executeQuery(query, [name, phone, email, address, commission_rate]);
}

// getDoctorById ahora selecciona solo las columnas existentes.
export async function getDoctorById(id: number): Promise<Doctor | null> {
    const results = await executeQuery<Doctor[]>('SELECT id, name, phone, email, address, commission_rate FROM doctors WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

// updateDoctor ahora usa solo los campos correctos.
export async function updateDoctor(id: number, doctor: Partial<Omit<Doctor, 'id'>>): Promise<void> {
    const { name, phone, email, address, commission_rate } = doctor;
    const query = 'UPDATE doctors SET name = ?, phone = ?, email = ?, address = ?, commission_rate = ? WHERE id = ?';
    await executeQuery(query, [name, phone, email, address, commission_rate, id]);
}

export async function deleteDoctor(id: number): Promise<void> {
  const query = 'DELETE FROM doctors WHERE id = ?';
  await executeQuery(query, [id]);
}
