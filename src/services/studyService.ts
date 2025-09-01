'use server';
import { executeQuery } from '@/lib/db';

export interface StudyParameter {
    name: string;
    unit: string;
    cost: number;
    factor: string;
    referenceType: string;
}

export interface IntegratedStudyRef {
    id: number;
    name: string;
}

export interface StudySample {
    type: string;
    container: string;
    indications: string;
    cost: number;
}

export interface Study {
    id: number;
    area: string;
    code: string;
    name: string;
    method: string;
    internalCost: number;
    deliveryTime: number;
    deliveryUnit: 'dias' | 'horas';
    processTime: string;
    processDays: string;
    isOutsourced: boolean;
    outsourcedLabId: string;
    outsourcedCode: string;
    outsourcedCost: number;
    outsourcedDeliveryTime: string;
    legend: string;
    scientificDescription: string;
    satServiceKey: string;
    satUnitKey: string;
    parameters: StudyParameter[];
    config: {
        showInRequest: boolean;
        canUploadDocuments: boolean;
        printLabSignature: boolean;
        printWebSignature: boolean;
        hasEnglishHeaders: boolean;
        printWithParams: boolean;
        generateWorkOrder: boolean;
    };
    hasSubStudies: boolean;
    isPackage: boolean;
    integratedStudies: IntegratedStudyRef[];
    synonyms: string[];
    samples: StudySample[];
    price: number;
    sampleType: string;
    category: string;
    shortcut: string;
}

export async function getStudies(): Promise<Study[]> {
    try {
        const results = await executeQuery('SELECT * FROM studies');
        const plainResults = JSON.parse(JSON.stringify(results)) as any[];
        return plainResults.map((row: any) => ({
            ...row,
            parameters: JSON.parse(row.parameters || '[]'),
            config: JSON.parse(row.config || '{}'),
            integratedStudies: JSON.parse(row.integratedStudies || '[]'),
            synonyms: JSON.parse(row.synonyms || '[]'),
            samples: JSON.parse(row.samples || '[]'),
        }));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

export async function createStudy(study: Omit<Study, 'id'>): Promise<void> {
    const query = `
        INSERT INTO studies (
            area, code, name, method, internalCost, deliveryTime, deliveryUnit,
            processTime, processDays, isOutsourced, outsourcedLabId, outsourcedCode,
            outsourcedCost, outsourcedDeliveryTime, legend, scientificDescription,
            satServiceKey, satUnitKey, parameters, config, hasSubStudies, isPackage,
            integratedStudies, synonyms, samples, price, sampleType, category, shortcut
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        study.area, study.code, study.name, study.method, study.internalCost,
        study.deliveryTime, study.deliveryUnit, study.processTime, study.processDays,
        study.isOutsourced, study.outsourcedLabId, study.outsourcedCode, study.outsourcedCost,
        study.outsourcedDeliveryTime, study.legend, study.scientificDescription,
        study.satServiceKey, study.satUnitKey, JSON.stringify(study.parameters),
        JSON.stringify(study.config), study.hasSubStudies, study.isPackage,
        JSON.stringify(study.integratedStudies), JSON.stringify(study.synonyms),
        JSON.stringify(study.samples), study.internalCost, study.sampleType, study.area, study.code,
    ];
    await executeQuery(query, params);
}

export async function getStudyById(id: string): Promise<Study | null> {
    const results = await executeQuery('SELECT * FROM studies WHERE id = ?', [id]) as any[];
    if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        return {
            ...row,
            parameters: JSON.parse(row.parameters || '[]'),
            config: JSON.parse(row.config || '{}'),
            integratedStudies: JSON.parse(row.integratedStudies || '[]'),
            synonyms: JSON.parse(row.synonyms || '[]'),
            samples: JSON.parse(row.samples || '[]'),
        };
    }
    return null;
}

export async function updateStudy(id: string, study: Omit<Study, 'id'>): Promise<void> {
    const query = `
        UPDATE studies SET
            area = ?, code = ?, name = ?, method = ?, internalCost = ?, deliveryTime = ?, 
            deliveryUnit = ?, processTime = ?, processDays = ?, isOutsourced = ?, 
            outsourcedLabId = ?, outsourcedCode = ?, outsourcedCost = ?, 
            outsourcedDeliveryTime = ?, legend = ?, scientificDescription = ?, 
            satServiceKey = ?, satUnitKey = ?, parameters = ?, config = ?, 
            hasSubStudies = ?, isPackage = ?, integratedStudies = ?, synonyms = ?, 
            samples = ?, price = ?, sampleType = ?, category = ?, shortcut = ?
        WHERE id = ?
    `;
    const params = [
        study.area, study.code, study.name, study.method, study.internalCost,
        study.deliveryTime, study.deliveryUnit, study.processTime, study.processDays,
        study.isOutsourced, study.outsourcedLabId, study.outsourcedCode, study.outsourcedCost,
        study.outsourcedDeliveryTime, study.legend, study.scientificDescription,
        study.satServiceKey, study.satUnitKey, JSON.stringify(study.parameters),
        JSON.stringify(study.config), study.hasSubStudies, study.isPackage,
        JSON.stringify(study.integratedStudies), JSON.stringify(study.synonyms),
        JSON.stringify(study.samples), study.internalCost, study.sampleType, study.area, study.code,
        id
    ];
    await executeQuery(query, params);
}

export async function deleteStudy(id: string): Promise<void> {
    const query = 'DELETE FROM studies WHERE id = ?';
    await executeQuery(query, [id]);
}
