"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Check } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Importar el nuevo servicio genérico
import { getSettings, saveSettings } from "@/services/settingsService";

// Definir una estructura de estado inicial para todas las configuraciones
const initialSettings = {
    general_settings: { lab_name: "Laboratorios Maldonado", currency: "MXN" },
    report_settings: { showHeader: true, marginTop: "20" },
    email_settings: { host: "", port: 587, fromAddress: "" },
    // ... otras configuraciones con sus valores por defecto
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<Record<string, any>>(initialSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            try {
                // Cargar todas las configuraciones necesarias con una sola llamada
                const settingKeys = ['general_settings', 'report_settings', 'email_settings'];
                const loadedSettings = await getSettings(settingKeys);

                // Fusionar los ajustes cargados con los valores por defecto
                setSettings(prev => ({
                    ...prev,
                    ...loadedSettings
                }));

            } catch (error) {
                toast({ title: "Error", description: "No se pudieron cargar las configuraciones.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, [toast]);

    // Función unificada para manejar cambios en cualquier configuración
    const handleSettingChange = (key: string, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    // Función unificada para guardar una sección de configuración
    const handleSaveSettings = async (key: string, title: string) => {
        try {
            await saveSettings([{ key, value: settings[key] }]);
            toast({
                title: "Éxito",
                description: `La configuración de ${title} se ha guardado correctamente.`,
            });
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            toast({
                title: "Error",
                description: `No se pudo guardar la configuración de ${title}.`,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div>Cargando configuraciones...</div>;
    }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Configuraciones</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Configuraciones
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="reports">Informes</TabsTrigger>
            <TabsTrigger value="emails">Correos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
            <Card>
                <CardHeader><CardTitle>Configuraciones Generales</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="lab_name">Nombre del Laboratorio</Label>
                        <Input
                            id="lab_name"
                            value={settings.general_settings?.lab_name || ''}
                            onChange={(e) => handleSettingChange('general_settings', 'lab_name', e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="currency">Moneda</Label>
                        <Input
                            id="currency"
                            value={settings.general_settings?.currency || ''}
                            onChange={(e) => handleSettingChange('general_settings', 'currency', e.target.value)}
                        />
                    </div>
                </CardContent>
                <div className="flex justify-start p-6 pt-0">
                    <Button onClick={() => handleSaveSettings('general_settings', 'Generales')}>
                        <Check className="mr-2"/> Guardar
                    </Button>
                </div>
            </Card>
        </TabsContent>

        <TabsContent value="reports">
            <Card>
                <CardHeader><CardTitle>Configuración de Informes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="showHeader"
                            checked={settings.report_settings?.showHeader || false}
                            onCheckedChange={(c) => handleSettingChange('report_settings', 'showHeader', c)}
                        />
                        <Label htmlFor="showHeader">Mostrar Encabezado</Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marginTop">Margen Superior (px)</Label>
                        <Input
                            id="marginTop"
                            type="number"
                            value={settings.report_settings?.marginTop || '0'}
                            onChange={(e) => handleSettingChange('report_settings', 'marginTop', e.target.value)}
                        />
                    </div>
                </CardContent>
                <div className="flex justify-start p-6 pt-0">
                    <Button onClick={() => handleSaveSettings('report_settings', 'Informes')}>
                        <Check className="mr-2"/> Guardar
                    </Button>
                </div>
            </Card>
        </TabsContent>

        <TabsContent value="emails">
            <Card>
                <CardHeader><CardTitle>Configuración de Correo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="host">Host SMTP</Label>
                        <Input
                            id="host"
                            value={settings.email_settings?.host || ''}
                            onChange={(e) => handleSettingChange('email_settings', 'host', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Puerto</Label>
                        <Input
                            id="port"
                            type="number"
                            value={settings.email_settings?.port || 0}
                            onChange={(e) => handleSettingChange('email_settings', 'port', Number(e.target.value))}
                        />
                    </div>
                </CardContent>
                <div className="flex justify-start p-6 pt-0">
                    <Button onClick={() => handleSaveSettings('email_settings', 'Correo')}>
                        <Check className="mr-2"/> Guardar
                    </Button>
                </div>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
