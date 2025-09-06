"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import {connection} from "next/server";

// Interfaz actualizada para reflejar el schema de la BD (branch_id es número)
export interface Employee {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone: string | null;
  branch_id: number; // <--- CORREGIDO
  position: string;
}

// Interfaz para la vista de tabla, incluye el nombre de la sucursal
export interface EmployeeView extends Omit<Employee, 'branch_id'> {
    branchName: string;
}

// getEmployees ahora une las tablas para obtener el nombre de la sucursal
export async function getEmployees(): Promise<EmployeeView[]> {
    try {
        const query = `
            SELECT 
                e.id, e.name, e.username, e.email, e.phone, e.position,
                b.name as branchName 
            FROM employees e
            LEFT JOIN branches b ON e.branch_id = b.id
        `;
        const results = await executeQuery(query, []);
        return JSON.parse(JSON.stringify(results)) as EmployeeView[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

// createEmployee ahora usa branch_id
export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<void> {
    const { name, username, email, password, phone, branch_id, position } = employee;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const query = 'INSERT INTO employees (name, username, email, password, phone, branch_id, position) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, username, email, hashedPassword, phone, branch_id, position]);
}

// getEmployeeById ahora devuelve branch_id para poblar el formulario de edición
export async function getEmployeeById(id: number): Promise<Omit<Employee, 'password'> | null> {
    const results = await executeQuery<Omit<Employee, 'password'>[]>('SELECT id, name, username, email, phone, branch_id, position FROM employees WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Omit<Employee, 'password'>;
    }
    return null;
}

// updateEmployee ahora usa branch_id
export async function updateEmployee(id: number, employee: Partial<Omit<Employee, 'id' | 'password'>>): Promise<void> {
    const { name, username, email, phone, branch_id, position } = employee;

    // La actualización de contraseña se manejará por separado si es necesario
    const query = 'UPDATE employees SET name = ?, username = ?, email = ?, phone = ?, branch_id = ?, position = ? WHERE id = ?';
    const params = [name, username, email, phone, branch_id, position, id];

    await executeQuery(query, params);
}

export async function deleteEmployee(id: number): Promise<void> {
  const query = 'DELETE FROM employees WHERE id = ?';
  await executeQuery(query, [id]);
}
