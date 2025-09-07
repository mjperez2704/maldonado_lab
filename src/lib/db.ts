'use server';

import mysql from 'mysql2/promise';
import dataNull from "./datanull.json";

// Configuración de la base de datos
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

function getTableNameFromQuery(query: string): keyof typeof dataNull | null {
    const match = query.match(/(?:FROM|INTO|UPDATE|DELETE\s+FROM)\s+`?(\w+)`?/i);
    if (match && match[1]) {
        return match[1] as keyof typeof dataNull;
    }
    return null;
}

export async function executeQuery<T>(query: string, values: any[] = []): Promise<T> {
    if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
        console.warn("Database environment variables are not fully configured.");
        const tableName = getTableNameFromQuery(query);
        if (tableName && tableName in dataNull) {
            return dataNull[tableName] as T;
        }
        // Devuelve un array vacío si no hay credenciales
        return [] as T;
    }

    let connection;
    try {
        // Crea una nueva conexión para esta consulta específica
        connection = await mysql.createConnection(dbConfig);
        // Usa .execute() para seguridad contra inyección SQL
        const [results] = await connection.execute(query, values);
        return results as T;
    } catch (error) {
        console.error("Database Query Error:", error);

        const tableName = getTableNameFromQuery(query);
        if (tableName && tableName in dataNull) {
            console.log(`Query failed for table '${tableName}'. Returning empty fallback data.`);
            return dataNull[tableName] as T;
        }

        // Devuelve un array vacío para que la UI no se rompa
        return [] as T;
    } finally {
        // Asegúrate de que la conexión se cierre SIEMPRE,
        // tanto si la consulta tuvo éxito como si falló.
        if (connection) {
            await connection.end();
        }
    }
}
