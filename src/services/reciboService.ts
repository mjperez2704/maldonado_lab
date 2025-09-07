'use server';
import { executeQuery } from '@/lib/db';

export interface TestResult {
    studyName: string;
    parameterName: string; // Keep it as string, empty for main study result
    result: string;
    reference: string;
    unit?: string;
}

export interface Recibo {
    id: number;
    createdBy: string;
    barcode: string;
    patientCode: string;
    patientName: string;
    contract?: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    due: number;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    studies: string[];
    packages: string[];
    doctor?: string;
    deliveryDate?: string;
    results?: TestResult[];
}

export type ReciboCreation = Omit<Recibo, 'id' | 'createdBy' | 'barcode' | 'date' | 'status'>;

export async function getRecibos(): Promise<Recibo[]> {
    try {
        const results = await executeQuery('SELECT * FROM recibos ORDER BY date DESC');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            studies: JSON.parse(row.studies || '[]'),
            packages: JSON.parse(row.packages || '[]'),
            results: JSON.parse(row.results || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createRecibo(reciboData: ReciboCreation): Promise<void> {
    // Faltaban las comillas invertidas (`) aquí
    const barcode = `BC-${Date.now()}`;
    const date = new Date().toISOString();
    const status: Recibo['status'] = 'pending';
    const createdBy = 'admin'; // Debería venir del usuario logueado

    const {
        patientCode, patientName, contract, subtotal, discount, total, paid, due,
        studies, packages, doctor, deliveryDate
    } = reciboData;

    // Y también faltaban las comillas invertidas (`) aquí para el texto de varias líneas
    const query = `
        INSERT INTO recibos (
            createdBy, barcode, patientCode, patientName, contract, 
            subtotal, discount, total, paid, due, date, status, 
            studies, packages, doctor, deliveryDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        createdBy, barcode, patientCode, patientName, contract,
        subtotal, discount, total, paid, due, date, status,
        JSON.stringify(studies), JSON.stringify(packages), doctor, deliveryDate
    ];

    await executeQuery(query, params);
}

export async function getReciboById(id: string): Promise<Recibo | null> {
     try {
        const results: any[] = await executeQuery('SELECT * FROM recibos WHERE id = ?', [id]);
        if (results.length > 0) {
            const row = JSON.parse(JSON.stringify(results[0]));
            return {
                ...row,
                studies: JSON.parse(row.studies || '[]'),
                packages: JSON.parse(row.packages || '[]'),
                results: JSON.parse(row.results || '[]')
            };
        }
        return null;
    } catch (error) {
        console.error("Database query failed:", error);
        return null;
    }
}

export async function saveResults(id: number, results: TestResult[]): Promise<void> {
    const query = 'UPDATE recibos SET results = ?, status = ? WHERE id = ?';
    await executeQuery(query, [JSON.stringify(results), 'completed', id]);
}
