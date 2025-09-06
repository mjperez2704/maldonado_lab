"use server";
import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface Package {
    id: number;
    name: string;
    shortcut: string;
    price: number;
    precautions: string;
    tests: string[];
    cultures: string[];
}

export async function getPackages(): Promise<Package[]> {
    try {
        const results = await executeQuery<any[]>('SELECT * FROM packages', []);
        const plainResults = JSON.parse(JSON.stringify(results));
        return plainResults.map((pkg: any) => ({
            ...pkg,
            tests: Array.isArray(pkg.tests) ? pkg.tests : JSON.parse(pkg.tests || '[]'),
            cultures: Array.isArray(pkg.cultures) ? pkg.cultures : JSON.parse(pkg.cultures || '[]')
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createPackage(pkg: Omit<Package, 'id'>): Promise<void> {
    const { name, shortcut, price, precautions, tests, cultures } = pkg;
    const query = 'INSERT INTO packages (name, shortcut, price, precautions, tests, cultures) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, shortcut, price, precautions, JSON.stringify(tests), JSON.stringify(cultures)]);
}

export async function getPackageById(id: number): Promise<Package | null> {
    const results = await executeQuery<any[]>('SELECT * FROM packages WHERE id = ?', [id]);
    if (results.length > 0) {
        const pkg = JSON.parse(JSON.stringify(results[0]));
        return {
            ...pkg,
            tests: Array.isArray(pkg.tests) ? pkg.tests : JSON.parse(pkg.tests || '[]') as string[],
            cultures: Array.isArray(pkg.cultures) ? pkg.cultures : JSON.parse(pkg.cultures || '[]') as string[]
        };
    }
    return null;
}

export async function updatePackage(id: number, pkg: Omit<Package, 'id'>): Promise<void> {
    const { name, shortcut, price, precautions, tests, cultures } = pkg;
    const query = 'UPDATE packages SET name = ?, shortcut = ?, price = ?, precautions = ?, tests = ?, cultures = ? WHERE id = ?';
    await executeQuery(query, [name, shortcut, price, precautions, JSON.stringify(tests), JSON.stringify(cultures), id]);
}


export async function deletePackage(id: number): Promise<void> {
    const query = 'DELETE FROM packages WHERE id = ?';
    await executeQuery(query, [id]);
}
