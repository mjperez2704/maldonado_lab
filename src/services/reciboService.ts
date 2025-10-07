
'use server';
import { executeQuery } from '@/lib/db';

export interface TestResult {
    estudio_id: string;
    parameterName: string; // Keep it as string, empty for main study result
    result: string;
    reference: string;
    unit?: string;
}

export interface Recibo {
    id: number;
    creado_por_id: string;
    codigoBarras: string;
    codigoPaciente: string;
    nombrePaciente: string;
    contract?: string;
    subtotal: number;
    descuento: number;
    total: number;
    pagado: number;
    adeudo: number;
    fecha: string;
    estado: 'pending' | 'completed' | 'cancelled';
    estudios: string[];
    paquetes: string[];
    doctor?: string;
    deliveryDate?: string;
    results?: TestResult[];
}

export type ReciboCreation = Omit<Recibo, 'id' | 'creado_por_id' | 'codigoBarras' | 'fecha' | 'estado'>;

export async function getRecibos(): Promise<Recibo[]> {
    try {
        const results = await executeQuery('SELECT * FROM recibos ORDER BY fecha DESC');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            estudios: JSON.parse(row.estudios || '[]'),
            paquetes: JSON.parse(row.paquetes || '[]'),
            results: JSON.parse(row.results || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createRecibo(reciboData: ReciboCreation, usuario_id: number): Promise<void> {
    const codigoBarras = `BC-${Date.now()}`;
    const fecha = new Date().toISOString();
    const estado: Recibo['estado'] = 'pending';
    const creado_por_id = usuario_id; // Debería venir del usuario logueado

    const {
        codigoPaciente, nombrePaciente, contract, subtotal, descuento, total, pagado, adeudo,
        estudios, paquetes, doctor, deliveryDate
    } = reciboData;

    const query = `
        INSERT INTO recibos (
            creado_por_id, codigoBarras, patientCode, patientName, contract, 
            subtotal, descuento, total, pagado, adeudo, fecha, estado, 
            estudios, paquetes, doctor, deliveryDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        creado_por_id, codigoBarras, codigoPaciente, nombrePaciente, contract,
        subtotal, descuento, total, pagado, adeudo, fecha, estado,
        JSON.stringify(estudios), JSON.stringify(paquetes), doctor, deliveryDate
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
                estudios: JSON.parse(row.estudios || '[]'),
                paquetes: JSON.parse(row.paquetes || '[]'),
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
    const query = 'UPDATE recibos SET results = ?, estado = ? WHERE id = ?';
    await executeQuery(query, [JSON.stringify(results), 'completed', id]);
}

export async function updateRecibo(id: number, recibo: Partial<Omit<Recibo, 'id'| 'fecha' | 'creado_por_id'>>): Promise<void> {
    const { 
        codigoPaciente, nombrePaciente, contract, subtotal, descuento, total, pagado, adeudo, 
        estado, estudios, paquetes, doctor, deliveryDate, results
    } = recibo;
    
    const query = `UPDATE recibos SET 
        patientCode = ?, patientName = ?, contract = ?, subtotal = ?, descuento = ?, 
        total = ?, pagado = ?, adeudo = ?, estado = ?, estudios = ?, paquetes = ?, 
        doctor = ?, deliveryDate = ?, results = ? 
        WHERE id = ?`;

    const params = [
        codigoPaciente, nombrePaciente, contract, subtotal, descuento, total, pagado, adeudo,
        estado, JSON.stringify(estudios), JSON.stringify(paquetes), doctor, deliveryDate,
        JSON.stringify(results), id
    ];

    await executeQuery(query, params);
}


export async function deleteRecibo(id: number): Promise<void> {
    const query = 'DELETE FROM recibos WHERE id = ?';
    await executeQuery(query, [id]);
}
