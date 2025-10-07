"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export interface empleado {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  contrasena?: string;
  telefono: string | null;
  sucursal_id: string;
  puesto: string;
  role_id: number;
}

export async function getEmpleados(): Promise<empleado[]> {
    try {
        const results = await executeQuery('SELECT id, nombre, usuario, email, telefono, sucursal_id, puesto FROM empleados');
        return JSON.parse(JSON.stringify(results)) as empleado[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function createEmpleado(empleado: Omit<empleado, 'id'>): Promise<void> {
    const { nombre, usuario, email, contrasena, telefono, sucursal_id, puesto } = empleado;
    const hashedcontrasena = contrasena ? await bcrypt.hash(contrasena, 10) : undefined;
    const query = 'INSERT INTO empleados (nombre, usuario, email, contrasena, telefono, sucursal_id, puesto) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [nombre, usuario, email, hashedcontrasena, telefono, sucursal_id, puesto]);
}

export async function getEmpleadoById(id: number): Promise<Omit<empleado, 'contrasena'> | null> {
    const results = await executeQuery<Omit<empleado, 'contrasena'>[]>('SELECT id, nombre, usuario, email, telefono, sucursal_id, puesto FROM empleados WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Omit<empleado, 'contrasena'>;
    }
    return null;
}

export async function updateEmpleado(id: number, empleado: Partial<Omit<empleado, 'id'>>): Promise<void> {
    const { nombre, usuario, email, contrasena, telefono, sucursal_id, puesto } = empleado;
    let query;
    let params;

    if (contrasena) {
        const hashedcontrasena = await bcrypt.hash(contrasena, 10);
        query = 'UPDATE empleados SET nombre = ?, usuario = ?, email = ?, contrasena = ?, telefono = ?, sucursal_id = ?, puesto = ? WHERE id = ?';
        params = [nombre, usuario, email, contrasena, telefono, sucursal_id, puesto, id];
    } else {
        query = 'UPDATE empleados SET nombre = ?, usuario = ?, email = ?, telefono = ?, sucursal_id = ?, puesto = ? WHERE id = ?';
        params = [nombre, usuario, email, telefono, sucursal_id, puesto, id];
    }

    await executeQuery(query, params);
}


export async function deleteEmpleado(id: number): Promise<void> {
  const query = 'DELETE FROM empleados WHERE id = ?';
  await executeQuery(query, [id]);
}
