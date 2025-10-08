"use server";
import { executeQuery } from '@/lib/db';



export interface Paciente {
  id: number;
  nombre: string;
  nacionalidad: string;
  ine: string;
  curp?: string;
  email?: string;
  telefono?: string;
  genero: string;
  fechaNacimiento: string;
  edad: number;
  unidad_edad: 'anios' | 'meses' ;
  direccion?: string;
  convenio_id?: number;
  url_avatar?: string;
}

export async function getPatients(): Promise<Paciente[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM pacientes');
        // Purificamos los resultados para Next.js
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createPatient(paciente: Omit<Paciente, 'id'>): Promise<void> {
    const { nombre, nacionalidad, ine, curp, email, telefono, genero, fechaNacimiento, edad, unidad_edad, direccion, convenio_id, url_avatar } = paciente;
    const query = 'INSERT INTO pacientes (nombre, nacionalidad, ine, curp, email, telefono, genero, fechaNacimiento, edad, unidad_edad, direccion, convenio_id, url_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [nombre, nacionalidad, ine, curp, email, telefono, genero, fechaNacimiento, edad, unidad_edad, direccion, convenio_id, url_avatar]);
}

export async function getPatientById(id: number): Promise<Paciente | null> {
    const results = await executeQuery<Paciente[]>('SELECT * FROM pacientes WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

export async function updatePatient(id: number, paciente: Omit<Paciente, "id">): Promise<void> {
    const { nombre, nacionalidad, ine, curp, email, telefono, genero, fechaNacimiento, edad, unidad_edad, direccion, convenio_id, url_avatar } = paciente;
    const query = 'UPDATE pacientes SET nombre = ?, nacionalidad = ?, ine = ?, curp = ?, email = ?, telefono = ?, genero = ?, fechaNacimiento = ?, edad = ?, unidad_edad = ?, direccion = ?, convenio_id = ?, url_avatar = ? WHERE id = ?';
    await executeQuery(query, [nombre, nacionalidad, ine, curp, email, telefono, genero, fechaNacimiento, edad, unidad_edad, direccion, convenio_id, url_avatar, id]);
}


export async function deletePatient(id: number): Promise<void> {
  const query = 'DELETE FROM pacientes WHERE id = ?';
  await executeQuery(query, [id]);
}
