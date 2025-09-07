
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Search, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { getRecibos, Recibo } from "@/services/reciboService";

export default function AccountsReceivablePage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    folio: '',
    patient: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchReceivables = async () => {
      try {
        const allRecibos = await getRecibos();
        const receivables = allRecibos.filter(r => r.due > 0);
        setRecibos(receivables);
      } catch (error) {
        console.error("Error fetching accounts receivable:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceivables();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({...prev, [id]: value}));
  }

  const filteredRecibos = useMemo(() => {
    return recibos.filter(recibo => {
        const folioMatch = filters.folio ? recibo.barcode.includes(filters.folio) : true;
        const patientMatch = filters.patient ? recibo.patientName.toLowerCase().includes(filters.patient.toLowerCase()) : true;
        const startDateMatch = filters.startDate ? new Date(recibo.date) >= new Date(filters.startDate) : true;
        const endDateMatch = filters.endDate ? new Date(recibo.date) <= new Date(filters.endDate) : true;
        return folioMatch && patientMatch && startDateMatch && endDateMatch;
    });
  }, [recibos, filters]);


  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Cuentas por Cobrar</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Cuentas por Cobrar
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Opciones de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="folio" placeholder="Folio" className="pl-10" value={filters.folio} onChange={handleFilterChange}/>
                    </div>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="patient" placeholder="Paciente" className="pl-10" value={filters.patient} onChange={handleFilterChange}/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Fecha Solicitud" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="yesterday">Ayer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Convenio" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="conv1">Convenio 1</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Doctor" /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="doc1">Dr. Juan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Estado de Pago" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="paid">Pagado</SelectItem>
                           <SelectItem value="unpaid">No Pagado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Seleccione Rango de Fechas:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="startDate" type="date" placeholder="Fecha Inicial" value={filters.startDate} onChange={handleFilterChange} className="pl-10"/>
                        </div>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="endDate" type="date" placeholder="Fecha Final" value={filters.endDate} onChange={handleFilterChange} className="pl-10"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:col-span-4 space-y-6 border-l md:pl-6">
                 <div>
                    <Label className="font-semibold">Opciones de Visualización</Label>
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                            <Checkbox id="show-billed" defaultChecked />
                            <Label htmlFor="show-billed">Mostrar Solicitudes Facturadas</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="show-unbilled" defaultChecked />
                            <Label htmlFor="show-unbilled">Mostrar Solicitudes Sin Facturar</Label>
                        </div>
                    </div>
                 </div>
                 <div>
                    <Label className="font-semibold">Selección Múltiple</Label>
                    <RadioGroup defaultValue="no" className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="multi-yes" />
                            <Label htmlFor="multi-yes">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="multi-no" />
                            <Label htmlFor="multi-no">No</Label>
                        </div>
                    </RadioGroup>
                 </div>
                 <Button className="w-full bg-green-600 hover:bg-green-700">Exportar a Excel</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Sucursal</TableHead>
                            <TableHead>Fecha Solicitud</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Convenio</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Estado Solicitud</TableHead>
                            <TableHead>Estado Resultados</TableHead>
                            <TableHead>Total Solicitud</TableHead>
                            <TableHead>Por Pagar</TableHead>
                            <TableHead>Facturar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={12} className="text-center">Cargando...</TableCell>
                            </TableRow>
                        ) : filteredRecibos.length > 0 ? (
                           filteredRecibos.map((recibo, index) => (
                               <TableRow key={recibo.id}>
                                   <TableCell>{index + 1}</TableCell>
                                   <TableCell>{recibo.barcode}</TableCell>
                                   <TableCell>Unidad Matriz</TableCell>
                                   <TableCell>{new Date(recibo.date).toLocaleDateString()}</TableCell>
                                   <TableCell>N/A</TableCell>
                                   <TableCell>{recibo.contract || 'N/A'}</TableCell>
                                   <TableCell>{recibo.patientName}</TableCell>
                                   <TableCell className="capitalize">{recibo.status}</TableCell>
                                   <TableCell>Pendiente</TableCell>
                                   <TableCell>${Number(recibo.total.toFixed(2))}</TableCell>
                                   <TableCell className="font-bold text-red-600">${Number(recibo.due.toFixed(2))}</TableCell>
                                   <TableCell>
                                       <Checkbox />
                                   </TableCell>
                               </TableRow>
                           ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={12} className="text-center py-10 text-muted-foreground">
                                    No se encontraron registros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
