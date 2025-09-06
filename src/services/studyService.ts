'use server';
import { executeQuery } from '@/lib/db';
import mysql from 'mysql2/promise';
import {connection} from "next/server";

// =================================================================
// INTERFACES NORMALIZADAS
// =================================================================

// Representa un registro en la tabla `services`
export interface Service {
    id: number;
    name: string;
    code: string | null;
    type: 'ESTUDIO' | 'CULTIVO' | 'PAQUETE';
    price: number | null;
    category_id: number | null;
    method: string | null;
    delivery_time: number | null;
    delivery_unit: 'dias' | 'horas' | null;
    indications: string | null;
}

// Representa un registro en la tabla `service_parameters`
export interface ServiceParameter {
    id?: number; // Opcional porque no se necesita al crear
    studyId?: number; // Opcional porque se asigna en el backend
    name: string;
    unit: string | null;
    reference_value: string | null;
    order: number | null;
}

// Representa un registro en la tabla `study_samples` (Asumida, basada en UI)
export interface StudySample {
    id?: number;
    studyId?: number;
    type: string;
    container: string | null;
    indications: string | null;
}

// Representa un registro en la tabla `package_items`
export interface PackageItem {
    package_id?: number;
    item_type: 'SERVICE' | 'PRODUCT';
    item_id: number;
    quantity: number;
}

// Una interfaz completa que agrupa todos los detalles de un estudio para las vistas de edición/creación
export interface StudyDetails extends Service {
    category_name?: string; // Para mostrar en la tabla
    parameters: ServiceParameter[];
    samples: StudySample[];
    packageItems: PackageItem[];
}


// =================================================================
// FUNCIONES DEL SERVICIO
// =================================================================

/**
 * Obtiene una lista simplificada de todos los servicios para la tabla principal.
 */

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT) || 3306,
    // Opciones importantes para estabilidad
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
};



export async function getStudies(): Promise<(Service & { category_name: string | null })[]> {
    try {
        const query = `
            SELECT s.*, c.name as category_name
            FROM services s
            LEFT JOIN categories c ON s.category_id = c.id
            ORDER BY s.name 
        `;
        const results = await executeQuery(query, []);
        return JSON.parse(JSON.stringify(results));
    } catch (error) {
        console.error("Database query failed:", error);
        return [];
    }
}

/**
 * Obtiene todos los detalles de un único estudio por su ID.
 */
export async function getStudyById(id: number): Promise<StudyDetails | null> {
    const serviceQuery = 'SELECT * FROM services WHERE id = ?';
    const paramsQuery = 'SELECT * FROM service_parameters WHERE service_id = ? ORDER BY `order` ';
    const samplesQuery = 'SELECT * FROM study_samples WHERE studyId = ?'; // Asumiendo tabla study_samples
    const packageQuery = 'SELECT * FROM package_items WHERE package_id = ?';

    try {
        const [serviceResult, parameters, samples, packageItems] = await Promise.all([
            executeQuery<Service[]>(serviceQuery, [id]),
            executeQuery<ServiceParameter[]>(paramsQuery, [id]),
            executeQuery<StudySample[]>(samplesQuery, [id]),
            executeQuery<PackageItem[]>(packageQuery, [id])
        ]);

        if (serviceResult.length === 0) {
            return null;
        }

        return {
            ...serviceResult[0],
            parameters,
            samples,
            packageItems
        };
    } catch (error) {
        console.error("Error fetching study details:", error);
        return null;
    }
}

/**
 * Crea un nuevo estudio y todos sus datos relacionados dentro de una transacción.
 */
export async function createStudy(studyData: Omit<StudyDetails, 'id'>): Promise<void> {
    const connection = await mysql.createConnection(dbConfig); // Crea una conexión utilizando la configuración existente
    try {
        // 1. Insertar el servicio principal
        const serviceQuery = `
            INSERT INTO services (name, code, type, price, category_id, method, delivery_time, delivery_unit, indications)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const serviceResult = await executeQuery(serviceQuery, [
            studyData.name, studyData.code, studyData.type, studyData.price, studyData.category_id,
            studyData.method, studyData.delivery_time, studyData.delivery_unit, studyData.indications
        ]) as any;
        const newStudyId = serviceResult.insertId;

        // 2. Insertar los parámetros
        if (studyData.parameters && studyData.parameters.length > 0) {
            const paramQuery = 'INSERT INTO service_parameters (service_id, name, unit, reference_value, `order`) VALUES ?';
            const paramValues = studyData.parameters.map(p => [newStudyId, p.name, p.unit, p.reference_value, p.order]);
            await executeQuery(paramQuery, [paramValues]);
        }

        // 3. Insertar las muestras (asumiendo tabla study_samples)
        if (studyData.samples && studyData.samples.length > 0) {
            const sampleQuery = 'INSERT INTO study_samples (studyId, type, container, indications) VALUES ?';
            const sampleValues = studyData.samples.map(s => [newStudyId, s.type, s.container, s.indications]);
            await connection.execute(sampleQuery, [sampleValues]);
        }

        // 4. Insertar los items del paquete (si es un paquete)
        if (studyData.type === 'PAQUETE' && studyData.packageItems && studyData.packageItems.length > 0) {
            const packageQuery = 'INSERT INTO package_items (package_id, item_type, item_id, quantity) VALUES ?';
            const packageValues = studyData.packageItems.map(i => [newStudyId, i.item_type, i.item_id, i.quantity]);
            await connection.execute(packageQuery, [packageValues]);
        }

        await connection.commit(); // Confirma la transacción si todo fue exitoso
    } catch (error) {
        await connection.rollback(); // Revierte todo si algo falló
        console.error("Failed to create study:", error);
        throw error; // Re-lanza el error para que el frontend lo maneje
    }
}

/**
 * Actualiza un estudio y sus datos relacionados usando la estrategia "borrar y re-insertar" dentro de una transacción.
 */
export async function updateStudy(id: number, studyData: StudyDetails): Promise<void> {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    try {
        // 1. Actualizar el servicio principal
        const serviceQuery = `
            UPDATE services SET 
                name = ?, code = ?, type = ?, price = ?, category_id = ?, method = ?, 
                delivery_time = ?, delivery_unit = ?, indications = ?
            WHERE id = ?
        `;
        await connection.execute(serviceQuery, [
            studyData.name, studyData.code, studyData.type, studyData.price, studyData.category_id,
            studyData.method, studyData.delivery_time, studyData.delivery_unit, studyData.indications,
            id
        ]);

        // 2. Borrar e re-insertar parámetros
        await executeQuery('DELETE FROM service_parameters WHERE service_id = ?', [id]);
        if (studyData.parameters && studyData.parameters.length > 0) {
            const paramQuery = 'INSERT INTO service_parameters (service_id, name, unit, reference_value, `order`) VALUES ?';
            const paramValues = studyData.parameters.map(p => [id, p.name, p.unit, p.reference_value, p.order]);
            await executeQuery(paramQuery, [paramValues]);
        }

        // 3. Borrar e re-insertar muestras
        await executeQuery('DELETE FROM study_samples WHERE studyId = ?', [id]);
        if (studyData.samples && studyData.samples.length > 0) {
            const sampleQuery = 'INSERT INTO study_samples (studyId, type, container, indications) VALUES ?';
            const sampleValues = studyData.samples.map(s => [id, s.type, s.container, s.indications]);
            await executeQuery(sampleQuery, [sampleValues]);
        }

        // 4. Borrar e re-insertar items del paquete
        await executeQuery('DELETE FROM package_items WHERE package_id = ?', [id]);
        if (studyData.type === 'PAQUETE' && studyData.packageItems && studyData.packageItems.length > 0) {
            const packageQuery = 'INSERT INTO package_items (package_id, item_type, item_id, quantity) VALUES ?';
            const packageValues = studyData.packageItems.map(i => [id, i.item_type, i.item_id, i.quantity]);
            await executeQuery(packageQuery, [packageValues]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Failed to update study:", error);
        throw error;
    }
}

/**
 * Elimina un estudio. La base de datos se encargará de eliminar los datos relacionados en cascada.
 */
export async function deleteStudy(id: number): Promise<void> {
    // ON DELETE CASCADE en la BD se encargará de los registros en tablas relacionadas
    const query = 'DELETE FROM services WHERE id = ?';
    await executeQuery(query, [id]);
}
