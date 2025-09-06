
'use server';

import { executeQuery } from '@/lib/db';
import {connection} from "next/server";

export interface Role {
    id: number;
    name: string;
}

export interface Permission {
    roleId: number;
    moduleKey: string;
}

export async function getRoles(): Promise<Role[]> {
    try {
        const results = await executeQuery('SELECT * FROM roles', []);
        return JSON.parse(JSON.stringify(results)) as Role[];
    } catch (error) {
        console.error("Database query failed for getRoles:", error);
        return [];
    }
}

export async function getPermissionsByRole(roleId: number): Promise<Permission[]> {
    try {
        const results = await executeQuery('SELECT roleId, moduleKey FROM permissions WHERE roleId = ?', [roleId]);
        return JSON.parse(JSON.stringify(results)) as Permission[];
    } catch (error) {
        console.error(`Database query failed for getPermissionsByRole (roleId: ${roleId}):`, error);
        return [];
    }
}

export async function updatePermissionsForRole(roleId: number, moduleKeys: string[]): Promise<void> {
    try {
        // En una transacción para asegurar la integridad
        // 1. Borrar todos los permisos existentes para ese rol
        await executeQuery('DELETE FROM permissions WHERE roleId = ?', [roleId]);

        // 2. Insertar los nuevos permisos si hay alguno
        if (moduleKeys.length > 0) {
            const values = moduleKeys.map(key => [roleId, key]);
            const query = 'INSERT INTO permissions (roleId, moduleKey) VALUES ?';
            await executeQuery(query, [values]);
        }
    } catch (error) {
        console.error(`Database transaction failed for updatePermissionsForRole (roleId: ${roleId}):`, error);
        throw new Error('Failed to update permissions.');
    }
}

/**
 * Verifica si un rol tiene acceso a un módulo específico.
 * Esta función se usaría para proteger rutas o renderizar componentes condicionalmente.
 */
export async function hasPermission(roleId: number, moduleKey: string): Promise<boolean> {
    try {
        const results = await executeQuery('SELECT 1 FROM permissions WHERE roleId = ? AND moduleKey = ? LIMIT 1', [roleId, moduleKey]);
        return (results as any[]).length > 0;
    } catch (error) {
        console.error(`Database query failed for hasPermission (roleId: ${roleId}, moduleKey: ${moduleKey}):`, error);
        // Por seguridad, si hay un error en la BD, se deniega el permiso.
        return false;
    }
}
