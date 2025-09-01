
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Save, Upload, Ruler, ImagePlay, Droplets } from "lucide-react";
import React from 'react';
import Link from "next/link";

const TemplateSection = ({ title }: { title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`image-upload-${title}`}>Cargar Imagen</Label>
                <div className="flex items-center gap-2">
                    <Input id={`image-upload-${title}`} type="file" />
                    <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`width-${title}`}>Ancho</Label>
                    <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id={`width-${title}`} placeholder="ej. 210mm" className="pl-10"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`height-${title}`}>Alto</Label>
                     <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id={`height-${title}`} placeholder="ej. 297mm" className="pl-10"/>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                    <ImagePlay className="h-5 w-5 text-primary"/>
                    <Label htmlFor={`background-${title}`}>Establecer como fondo</Label>
                </div>
                <Switch id={`background-${title}`} />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary"/>
                    <Label htmlFor={`watermark-${title}`}>Establecer como marca de agua</Label>
                </div>
                <Switch id={`watermark-${title}`} />
            </div>
        </CardContent>
    </Card>
);

export default function ReportTemplatesPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Plantillas de Informes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/configuraciones" className="hover:text-primary">Configuraciones</Link> / Plantillas de Informes
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Diseño de Plantilla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TemplateSection title="Encabezado" />
                <TemplateSection title="Cuerpo" />
                <TemplateSection title="Pie de página" />
            </div>
             <div className="flex justify-end">
                <Button>
                    <Save className="mr-2" /> Guardar Plantilla
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
