'use server';
import { executeQuery } from '@/lib/db';

export interface Doctor {
    id: number;
    code: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    commission: number;
    total: number;
    paid: number;
    due: number;
}

export async function getDoctors(): Promise<Doctor[]> {
    try {
        const results = await executeQuery('SELECT * FROM doctors');
        // Convertimos los resultados a objetos simples
        return JSON.parse(JSON.stringify(results)) as Doctor[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createDoctor(doctor: Omit<Doctor, 'id' | 'code' | 'total' | 'paid' | 'due'>): Promise<void> {
    const { name, phone, email, address, commission } = doctor;
    // El código único y los totales se manejarán de otra forma o se les asignará un valor por defecto.
    // Por ahora, generaremos un código simple basado en el timestamp para mantener la funcionalidad.
    const code = `DR${Date.now()}`;
    const query = 'INSERT INTO doctors (code, name, phone, email, address, commission, total, paid, due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [code, name, phone, email, address, commission, 0, 0, 0]);
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
    const results = await executeQuery<Doctor[]>('SELECT * FROM doctors WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
}

export async function updateDoctor(id: number, doctor: Partial<Omit<Doctor, 'id' | 'code' | 'total' | 'paid' | 'due'>>): Promise<void> {
    const { name, phone, email, address, commission } = doctor;
    const query = 'UPDATE doctors SET name = ?, phone = ?, email = ?, address = ?, commission = ? WHERE id = ?';
    await executeQuery(query, [name, phone, email, address, commission, id]);
}


export async function deleteDoctor(id: number): Promise<void> {
  const query = 'DELETE FROM doctors WHERE id = ?';
  await executeQuery(query, [id]);
}
