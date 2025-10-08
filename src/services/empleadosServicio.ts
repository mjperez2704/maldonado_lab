
"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export interface Empleado {
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

export async function getEmpleados(): Promise<Empleado[]> {
    try {
        const results = await executeQuery('SELECT id, nombre, usuario, email, telefono, sucursal_id, puesto, role_id FROM empleados');
        return JSON.parse(JSON.stringify(results)) as Empleado[];
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return [];
    }
}

export async function getNombreEmpleadoById(empleado_id: number): Promise<string> {
    try {
        const results = await executeQuery<Empleado[]>('SELECT nombre FROM empleados WHERE id = ?', [empleado_id]);
        if (results && results.length > 0) {
            return results[0].nombre;
        }
    } catch (error) {
        console.error(`Error fetching employee name for id ${empleado_id}:`, error);
    }
    return 'Usuario';
}

export async function createEmpleado(empleado: Omit<Empleado, 'id'>): Promise<void> {
    const { nombre, usuario, email, contrasena, telefono, sucursal_id, puesto, role_id } = empleado;
    const hashedcontrasena = contrasena ? await bcrypt.hash(contrasena, 10) : undefined;
    const query = 'INSERT INTO empleados (nombre, usuario, email, contrasena, telefono, sucursal_id, puesto, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [nombre, usuario, email, hashedcontrasena, telefono, sucursal_id, puesto, role_id]);
}

export async function getEmployeeById(id: number): Promise<Omit<Empleado, 'contrasena'> | null> {
    const results = await executeQuery<Omit<Empleado, 'contrasena'>[]>('SELECT id, nombre, usuario, email, telefono, sucursal_id, puesto, role_id FROM empleados WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Omit<Empleado, 'contrasena'>;
    }
    return null;
}

export async function updateEmpleado(id: number, empleado: Partial<Omit<Empleado, 'id'>>): Promise<void> {
    const { nombre, usuario, email, contrasena, telefono, sucursal_id, puesto, role_id } = empleado;
    let query;
    let params;

    if (contrasena) {
        const hashedcontrasena = await bcrypt.hash(contrasena, 10);
        query = 'UPDATE empleados SET nombre = ?, usuario = ?, email = ?, contrasena = ?, telefono = ?, sucursal_id = ?, puesto = ?, role_id = ? WHERE id = ?';
        params = [nombre, usuario, email, hashedcontrasena, telefono, sucursal_id, puesto, role_id, id];
    } else {
        query = 'UPDATE empleados SET nombre = ?, usuario = ?, email = ?, telefono = ?, sucursal_id = ?, puesto = ?, role_id = ? WHERE id = ?';
        params = [nombre, usuario, email, telefono, sucursal_id, puesto, role_id, id];
    }

    await executeQuery(query, params);
}


export async function deleteEmpleado(id: number): Promise<void> {
  const query = 'DELETE FROM empleados WHERE id = ?';
  await executeQuery(query, [id]);
}

