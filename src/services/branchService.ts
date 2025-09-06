"use server";
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface Branch {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

export async function getBranches(): Promise<Branch[]> {
    try {
        const results = await executeQuery('SELECT * FROM branches', []);
        return JSON.parse(JSON.stringify(results)) as Branch[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createBranch(branch: Omit<Branch, 'id'>): Promise<void> {
    try {
        const { name, phone, address } = branch;
        const query = 'INSERT INTO branches (name, phone, address) VALUES (?, ?, ?)';
        await executeQuery(query, [name, phone, address]);
    } catch (error) {
        console.error("Database query failed:", error);
        //return [];
    }
}

export async function getBranchById(id: number): Promise<Branch | null> {
    const results = await executeQuery<Branch[]>('SELECT * FROM branches WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
}

export async function updateBranch(id: number, branch: Partial<Omit<Branch, 'id'>>): Promise<void> {
    const { name, phone, address } = branch;
    const query = 'UPDATE branches SET name = ?, phone = ?, address = ? WHERE id = ?';
    await executeQuery(query, [name, phone, address, id]);
}


export async function deleteBranch(id: number): Promise<void> {
  const query = 'DELETE FROM branches WHERE id = ?';
  await executeQuery(query, [id]);
}
