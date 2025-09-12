
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart } from "lucide-react";
import Link from "next/link";
import React from 'react';

const systemReports = [
    { name: "Solicitudes del Día", description: "Muestra todas las solicitudes de exámenes generadas hoy." },
    { name: "Corte de Caja Diario", description: "Detalle de ingresos y egresos para el cierre de caja." },
    { name: "Estudios por Paciente", description: "Historial de estudios realizados por un paciente específico." },
    { name: "Resultados Pendientes", description: "Lista de solicitudes cuyos resultados aún no han sido capturados." },
    { name: "Inventario de Productos", description: "Estado actual del stock de productos y reactivos." },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Informes del Sistema</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Informes
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Informes del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Informe</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemReports.map((report) => (
                <TableRow key={report.name}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Generar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    