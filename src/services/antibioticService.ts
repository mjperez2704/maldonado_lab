"use server";

import { executeQuery } from '@/lib/db';
import type { Antibiotic } from '@/types/antibiotic';
import type { ServerActionResponse } from '@/types/api';

export async function getAntibiotics(): Promise<Antibiotic[]> {
    try {
        const results = await executeQuery('SELECT * FROM antibioticos');
        return JSON.parse(JSON.stringify(results)) as Antibiotic[];
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createAntibiotic(antibiotic: Omit<Antibiotic, 'id'>): Promise<void> {
    const { name, shortcut, commercialName, administrationRoute, presentation, laboratory } = antibiotic;
    const query = 'INSERT INTO antibioticos (nombre, acceso directo, nombreComercial, viaAdministracion, presentación, laboratorio) VALUES (?, ?, ?, ?, ?, ?)';
    await executeQuery(query, [name, shortcut, commercialName, administrationRoute, presentation, laboratory]);
}

export async function getAntibioticById(id: number): Promise<Antibiotic | null> {
    const results = await executeQuery<Antibiotic[]>('SELECT * FROM antibioticos WHERE id = ?', [id]);
    if (results.length > 0) {
        return JSON.parse(JSON.stringify(results[0]));
    }
    return null;
}

export async function updateAntibiotic(id: number, antibiotic: Partial<Omit<Antibiotic, 'id'>>): Promise<void> {
    const fields = Object.keys(antibiotic) as (keyof typeof antibiotic)[];
    if (fields.length === 0) {
        return;
    }

    const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');
    const values = fields.map(field => antibiotic[field]);

    const query = `UPDATE antibioticos SET ${setClause} WHERE id = ?`;
    // @ts-ignore
    values.push(id);

    await executeQuery(query, values);
}


export async function deleteAntibiotic(id: number): Promise<ServerActionResponse> {
    try {
        const query = 'DELETE FROM antibioticos WHERE id = ?';
        await executeQuery(query, [id]);
        return { success: true, data: null, error: null };
    } catch (error) {
        console.error("No se ha podido eliminar el antibiótico:", error);
        const errorMessage = error instanceof Error ? error.message : "Se ha producido un error desconocido";
        return { success: false, data: null, error: { message: "No se pudo eliminar el antibiótico.", details: errorMessage } };
    }
}
