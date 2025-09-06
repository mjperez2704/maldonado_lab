"use server";
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface Provider {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export async function getProviders(): Promise<Provider[]> {
    try {
        const results = await executeQuery('SELECT * FROM providers', []);
        return JSON.parse(JSON.stringify(results)) as Provider[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createProvider(provider: Omit<Provider, 'id'>): Promise<void> {
    const { name, phone, email, address } = provider;
    const query = 'INSERT INTO providers (name, phone, email, address) VALUES (?, ?, ?, ?)';
    await executeQuery(query, [name, phone, email, address]);
}

export async function getProviderById(id: number): Promise<Provider | null> {
    const results = await executeQuery<Provider[]>('SELECT * FROM providers WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0])) as Provider;
    }
    return null;
}

export async function updateProvider(id: number, provider: Partial<Omit<Provider, 'id'>>): Promise<void> {
    const { name, phone, email, address } = provider;
    const query = 'UPDATE providers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?';
    await executeQuery(query, [name, phone, email, address, id]);
}


export async function deleteProvider(id: number): Promise<void> {
  const query = 'DELETE FROM providers WHERE id = ?';
  await executeQuery(query, [id]);
}
