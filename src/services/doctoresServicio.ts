'use server';
import { executeQuery } from '@/lib/db';

export interface Doctor {
    id: number;
    codigo: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    comision: number;
    total: number;
    pagado: number;
    adeudo: number;
}

export async function getDoctores(): Promise<Doctor[]> {
    try {
        const results = await executeQuery('SELECT * FROM doctores');
        // Convertimos los resultados a objetos simples
        return JSON.parse(JSON.stringify(results)) as Doctor[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createDoctor(doctor: Omit<Doctor, 'id' | 'codigo' | 'total' | 'pagado' | 'adeudo'>): Promise<void> {
    const { nombre, telefono, email, direccion, comision } = doctor;
    // El código único y los totales se manejarán de otra forma o se les asignará un valor por defecto.
    // Por ahora, generaremos un código simple basado en el timestamp para mantener la funcionalidad.
    const code = `DR${Date.now()}`;
    const query = 'INSERT INTO doctores (codigo, nombre, telefono, email, direccion, comision, total, pagado, adeudo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [nombre, telefono, email, direccion, comision]);
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
    const results = await executeQuery<Doctor[]>('SELECT * FROM doctores WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
}

export async function updateDoctor(id: number, doctor: Partial<Omit<Doctor, 'id' | 'codigo' | 'total' | 'pagado' | 'adeudo'>>): Promise<void> {
    const { nombre, telefono, email, direccion, comision } = doctor;
    const query = 'UPDATE doctors SET nombre = ?, telefono = ?, email = ?, direccion = ?, comision = ? WHERE id = ?';
    await executeQuery(query, [nombre, telefono, email, direccion, comision, id]);
}


export async function deleteDoctor(id: number): Promise<void> {
  const query = 'DELETE FROM doctores WHERE id = ?';
  await executeQuery(query, [id]);
}
