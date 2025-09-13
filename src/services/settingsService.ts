

"use server";
import { executeQuery } from '@/lib/db';

export interface FontSettings {
    color: string;
    font: string;
    size: string;
}

export interface ReportSettings {
    showHeader: boolean;
    showPatientAvatar: boolean;
    showFooter: boolean;
    showSignature: boolean;
    showQr: boolean;
    marginTop: string;
    marginRight: string;
    marginBottom: string;
    marginLeft: string;
    contentMarginTop: string;
    contentMarginBg: string;
    qrcodeDimension: string;
    headerAlign: 'left' | 'center' | 'right';
    headerBorderColor: string;
    headerBorderWidth: number;
    headerBgColor: string;
    branchName: FontSettings;
    branchInfo: FontSettings;
    patientTitle: FontSettings;
    patientData: FontSettings;
    testTitle: FontSettings;
    testName: FontSettings;
}

export interface EmailTemplate {
    active: boolean;
    subject: string;
    body: string;
}

export interface EmailSettings {
    host: string;
    port: number;
    username: string;
    password?: string;
    encryption: 'ssl' | 'tls';
    fromAddress: string;
    fromName: string;
    headerColor: string;
    footerColor: string;
    patientCode: EmailTemplate;
    resetPassword: EmailTemplate;
    receipt: EmailTemplate;
    report: EmailTemplate;
}


export interface DbSettings {
    host: string;
    port: number;
    database: string;
    user: string;
    password?: string;
    ssl: boolean;
}

export interface GeneralSettings {
    labName: string;
    currency: string;
    timezone: string;
    language: string;
    location: string;
    phone: string;
    email: string;
    website: string;
    rights: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    reportLogoUrl?: string;
    mainLogoUrl?: string;
}

export interface WhatsappTemplate {
    active: boolean;
    message: string;
}

export interface WhatsappSettings {
    receiptLink: WhatsappTemplate;
    reportLink: WhatsappTemplate;
}


const SETTINGS_KEY_REPORTS = 'reports';
const SETTINGS_KEY_EMAIL = 'email';
const SETTINGS_KEY_DB = 'db';
const SETTINGS_KEY_GENERAL = 'general';
const SETTINGS_KEY_WHATSAPP = 'whatsapp';


async function getSetting<T>(key: string): Promise<T | null> {
    const results = await executeQuery<{ value: string }[]>('SELECT value FROM settings WHERE `key` = ?', [key]);
    if (results.length > 0) {
        try {
            return JSON.parse(results[0].value);
        } catch (e) {
            console.error(`Failed to parse setting for key: ${key}`, e);
            return null;
        }
    }
    return null;
}

async function saveSetting<T>(key: string, value: T): Promise<void> {
    const query = 'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?';
    const stringValue = JSON.stringify(value);
    await executeQuery(query, [key, stringValue, stringValue]);
}

// Reports
export const getReportSettings = async () => getSetting<ReportSettings>(SETTINGS_KEY_REPORTS);
export const saveReportSettings = async (settings: ReportSettings) => saveSetting(SETTINGS_KEY_REPORTS, settings);

// Email
export const getEmailSettings = async () => getSetting<EmailSettings>(SETTINGS_KEY_EMAIL);
export const saveEmailSettings = async (settings: EmailSettings) => saveSetting(SETTINGS_KEY_EMAIL, settings);

// DB
export const getDbSettings = async () => getSetting<DbSettings>(SETTINGS_KEY_DB);
export const saveDbSettings = async (settings: DbSettings) => saveSetting(SETTINGS_KEY_DB, settings);

// General
export const getGeneralSettings = async () => getSetting<GeneralSettings>(SETTINGS_KEY_GENERAL);
export const saveGeneralSettings = async (settings: GeneralSettings) => saveSetting(SETTINGS_KEY_GENERAL, settings);

// Whatsapp
export const getWhatsappSettings = async () => getSetting<WhatsappSettings>(SETTINGS_KEY_WHATSAPP);
export const saveWhatsappSettings = async (settings: WhatsappSettings) => saveSetting(SETTINGS_KEY_WHATSAPP, settings);


export async function testDbConnection(settings: DbSettings): Promise<{ success: boolean; error?: string }> {
    // This is a placeholder. In a real scenario, you would create a temporary
    // connection pool with the new settings to test them.
    // For now, we simulate success if host and user are present.
    if (settings.host && settings.user && settings.database) {
        // Here you would attempt a real connection
        return { success: true };
    }
    return { success: false, error: "Datos de conexión incompletos." };
}
