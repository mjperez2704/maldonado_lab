
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, MoreVertical, FileEdit, Trash2 } from "lucide-react";
import React from 'react';
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Datos simulados de plantillas
const templates = [
    { id: 1, nombre: "Reporte General", description: "Plantilla estándar para resultados de estudios." },
    { id: 2, nombre: "Reporte de Cultivos", description: "Plantilla específica para microbiología." },
    { id: 3, nombre: "Formato de Consentimiento", description: "Consentimiento informado para pacientes." },
];

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
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Listado de Plantillas</CardTitle>
            <Button asChild>
                <Link href="/configuraciones/plantillas/crear">
                    <Plus className="mr-2 h-4 w-4"/> Crear Nueva Plantilla
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">{template.nombre}</TableCell>
                                <TableCell>{template.description}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <FileEdit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
