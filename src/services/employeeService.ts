"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export interface Employee {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone: string | null;
  branch: string;
  position: string;
}

export async function getEmployees(): Promise<Employee[]> {
    try {
        const results = await executeQuery('SELECT id, name, username, email, phone, branch, position FROM employees');
        return JSON.parse(JSON.stringify(results)) as Employee[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<void> {
    const { name, username, email, password, phone, branch, position } = employee;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const query = 'INSERT INTO employees (name, username, email, password, phone, branch, position) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, username, email, hashedPassword, phone, branch, position]);
}

export async function getEmployeeById(id: number): Promise<Omit<Employee, 'password'> | null> {
    const results = await executeQuery<Omit<Employee, 'password'>[]>('SELECT id, name, username, email, phone, branch, position FROM employees WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Omit<Employee, 'password'>;
    }
    return null;
}

export async function updateEmployee(id: number, employee: Partial<Omit<Employee, 'id'>>): Promise<void> {
    const { name, username, email, password, phone, branch, position } = employee;
    let query;
    let params;

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query = 'UPDATE employees SET name = ?, username = ?, email = ?, password = ?, phone = ?, branch = ?, position = ? WHERE id = ?';
        params = [name, username, email, hashedPassword, phone, branch, position, id];
    } else {
        query = 'UPDATE employees SET name = ?, username = ?, email = ?, phone = ?, branch = ?, position = ? WHERE id = ?';
        params = [name, username, email, phone, branch, position, id];
    }

    await executeQuery(query, params);
}


export async function deleteEmployee(id: number): Promise<void> {
  const query = 'DELETE FROM employees WHERE id = ?';
  await executeQuery(query, [id]);
}
