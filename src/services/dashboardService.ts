'use server';
import { executeQuery } from '@/lib/db';

export interface DashboardStats {
    patientsCount: number;
    servicesCount: number;
    providersCount: number;
    doctorsCount: number;
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export interface OperationalStatus {
    pending: number;
    in_process: number;
    completed: number;
}

// Obtiene conteos generales para las tarjetas de estadísticas principales
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const [patientsResult, servicesResult, providersResult, doctorsResult] = await Promise.all([
            executeQuery<{ count: number }[]>('SELECT COUNT(*) as count FROM patients'),
            executeQuery<{ count: number }[]>('SELECT COUNT(*) as count FROM services'),
            executeQuery<{ count: number }[]>('SELECT COUNT(*) as count FROM providers'),
            executeQuery<{ count: number }[]>('SELECT COUNT(*) as count FROM doctors'),
        ]);

        return {
            patientsCount: patientsResult[0].count,
            servicesCount: servicesResult[0].count,
            providersCount: providersResult[0].count,
            doctorsCount: doctorsResult[0].count,
        };
    } catch (error) {
        console.error("Database query failed for dashboard stats:", error);
        return { patientsCount: 0, servicesCount: 0, providersCount: 0, doctorsCount: 0 };
    }
}

// Obtiene el resumen financiero del día actual
export async function getTodayFinancialSummary(): Promise<FinancialSummary> {
    try {
        const today = new Date().toISOString().split('T')[0];

        const incomeRecibosQuery = `SELECT SUM(paid) as total FROM recibos WHERE DATE(date) = ?`;
        const incomeOpsQuery = `SELECT SUM(total) as total FROM recibos WHERE status = 'completed' AND DATE(date) = ?`;

        const egressExpensesQuery = `SELECT SUM(amount) as total FROM expenses WHERE DATE(date) = ?`;
        const egressOpsQuery = `SELECT SUM(amount) as total FROM expenses WHERE category_id = 1 AND DATE(date) = ?`;

        const [
            incomeRecibosResult,
            incomeOpsResult,
            egressExpensesResult,
            egressOpsResult
        ] = await Promise.all([
            executeQuery<{ total: number | null }[]>(incomeRecibosQuery, [today]),
            executeQuery<{ total: number | null }[]>(incomeOpsQuery, [today]),
            executeQuery<{ total: number | null }[]>(egressExpensesQuery, [today]),
            executeQuery<{ total: number | null }[]>(egressOpsQuery, [today]),
        ]);

        const totalIncome = (incomeRecibosResult[0].total || 0) + (incomeOpsResult[0].total || 0);
        const totalExpenses = (egressExpensesResult[0].total || 0) + (egressOpsResult[0].total || 0);

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
        };
    } catch (error) {
        console.error("Database query failed for financial summary:", error);
        return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
}

// Obtiene el conteo de recibos por estado
export async function getOperationalStatus(): Promise<OperationalStatus> {
    try {
        const query = `
            SELECT status, COUNT(*) as count 
            FROM recibos 
            WHERE status IN ('pending', 'in_process', 'completed')
            GROUP BY status
        `;
        const results = await executeQuery<{ status: string, count: number }[]>(query);

        const statusMap = results.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {} as Record<string, number>);

        return {
            pending: statusMap['pending'] || 0,
            in_process: statusMap['in_process'] || 0,
            completed: statusMap['completed'] || 0,
        };
    } catch (error) {
        console.error("Database query failed for operational status:", error);
        return { pending: 0, in_process: 0, completed: 0 };
    }
}
