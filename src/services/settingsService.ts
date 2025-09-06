'use server';
import { executeQuery } from '@/lib/db';

// Una interfaz genérica para cualquier tipo de ajuste
export interface Setting {
  id?: number;
  name: string; // La 'key', ej: 'general_settings', 'email_settings'
  value: any;   // El 'value', un objeto JSON
}

/**
 * Obtiene un conjunto de configuraciones por sus nombres (claves).
 * Devuelve un objeto donde cada clave es el nombre de la configuración y el valor es el objeto de configuración.
 */
export async function getSettings(keys: string[]): Promise<Record<string, any>> {
    if (keys.length === 0) return {};
    try {
        const placeholders = keys.map(() => '?').join(',');
        const query = `SELECT name, value FROM settings WHERE name IN (${placeholders})`;
        const results = await executeQuery<Setting[]>(query, keys);
        
        const settingsObject = results.reduce((acc, setting) => {
            acc[setting.name] = JSON.parse(setting.value || '{}');
            return acc;
        }, {} as Record<string, any>);

        return settingsObject;
    } catch (error) {
        console.error("Database query failed for getSettings:", error);
        return {};
    }
}

/**
 * Guarda una o más configuraciones en la base de datos.
 * Utiliza ON DUPLICATE KEY UPDATE para insertar o actualizar según corresponda.
 */
export async function saveSettings(settings: { key: string, value: any }[]): Promise<void> {
    if (settings.length === 0) return;
    try {
        const query = `
            INSERT INTO settings (name, value) 
            VALUES ? 
            ON DUPLICATE KEY UPDATE value = VALUES(value)
        `;
        const values = settings.map(s => [s.key, JSON.stringify(s.value)]);
        await executeQuery(query, [values]);
    } catch (error) {
        console.error("Database query failed for saveSettings:", error);
        throw error;
    }
}
