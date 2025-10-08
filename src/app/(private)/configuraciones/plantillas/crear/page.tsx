
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Save, GripVertical, Settings, Square, Heading1, Heading2, Type, Pilcrow, Image, Barcode, List, AlignLeft, User, Calendar, VenetianMask, Microscope } from "lucide-react";
import React, { useState } from 'react';
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Componente para un elemento que se puede arrastrar
const DraggableItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div 
        className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-grab active:cursor-grabbing border border-dashed"
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", label)}
    >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
);

// Grupo de campos disponibles
const FieldGroup = ({ title, fields }: { title: string, fields: { icon: React.ReactNode, label: string }[] }) => (
    <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{title}</p>
        <div className="grid grid-cols-1 gap-2">
            {fields.map(field => <DraggableItem key={field.label} {...field} />)}
        </div>
    </div>
);


export default function CreateTemplatePage() {
  const [templateName, setTemplateName] = useState("");
  const [droppedItems, setDroppedItems] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    setDroppedItems(prev => [...prev, data]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Definición de los campos que se pueden arrastrar
  const availableFields = {
      patient: [
          { icon: <User className="h-4 w-4" />, label: "Nombre del Paciente" },
          { icon: <Calendar className="h-4 w-4" />, label: "Edad" },
          { icon: <VenetianMask className="h-4 w-4" />, label: "Género" },
      ],
      study: [
          { icon: <Microscope className="h-4 w-4" />, label: "Nombre del Estudio" },
          { icon: <List className="h-4 w-4" />, label: "Detalle de Parámetros" },
          { icon: <AlignLeft className="h-4 w-4" />, label: "Valores de Referencia" },
      ],
      layout: [
          { icon: <Heading1 className="h-4 w-4" />, label: "Título Principal" },
          { icon: <Heading2 className="h-4 w-4" />, label: "Subtítulo" },
          { icon: <Pilcrow className="h-4 w-4" />, label: "Párrafo de Texto" },
          { icon: <Image className="h-4 w-4" />, label: "Logo del Laboratorio" },
          { icon: <Barcode className="h-4 w-4" />, label: "Código de Barras" },
      ],
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Constructor de Plantillas</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/configuraciones/plantillas" className="hover:text-primary">Plantillas</Link> / Crear
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Panel Izquierdo: Campos y Propiedades */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <GripVertical /> Campos Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">Arrastra los campos al lienzo para construir tu reporte.</p>
                    <FieldGroup title="Datos del Paciente" fields={availableFields.patient} />
                    <Separator />
                    <FieldGroup title="Datos de Estudios" fields={availableFields.study} />
                    <Separator />
                    <FieldGroup title="Elementos de Diseño" fields={availableFields.layout} />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Settings /> Propiedades del Elemento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">Selecciona un elemento en el lienzo para ver sus propiedades.</p>
                </CardContent>
            </Card>
        </div>

        {/* Panel Derecho: Lienzo y Guardado */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <Label htmlFor="template-nombre">Nombre de la Plantilla</Label>
                        <Input 
                            id="template-nombre" 
                            placeholder="Ej. Reporte General de Resultados" 
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                    </div>
                     <Button>
                        <Save className="mr-2 h-4 w-4" /> Guardar Plantilla
                    </Button>
                </CardHeader>
                <CardContent
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="min-h-[800px] bg-white shadow-inner border border-dashed rounded-md p-8"
                >
                    <div className="w-full h-full space-y-4">
                        {droppedItems.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <Square className="h-16 w-16 mb-4" />
                                <h3 className="font-semibold">Lienzo Vacío</h3>
                                <p>Arrastra los campos desde el panel izquierdo aquí.</p>
                            </div>
                        ) : (
                            droppedItems.map((item, index) => (
                                <div key={index} className="p-4 bg-accent/50 border rounded-md cursor-pointer hover:border-primary">
                                    {item}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

