"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileStack, Search, Printer, FilePenLine, Mail, Calendar, User, Hash } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { getRecibos, ReciboView } from "@/services/reciboService";
// La función de envío de email se asume que existe y se adaptará si es necesario.
// import { sendEmailReport } from "@/ai/flows/sendReportFlow";

// Usar el tipo de dato correcto que devuelve el nuevo servicio
type ReciboForTable = Omit<ReciboView, 'details'>;

export default function ResultsReportPage() {
    const [recibos, setRecibos] = useState<ReciboForTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '', startDate: '', endDate: ''});
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await getRecibos();
                setRecibos(data);
            } catch (error) {
                console.error("Error fetching results:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los resultados.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [toast]);

    const filteredRecibos = useMemo(() => {
        return recibos.filter(recibo => {
            const folioMatch = filters.folio ? String(recibo.id).includes(filters.folio) : true;
            const patientMatch = filters.patient ? recibo.patient_name.toLowerCase().includes(filters.patient.toLowerCase()) : true;
            const startDateMatch = filters.startDate ? new Date(recibo.date) >= new Date(filters.startDate) : true;
            const endDateMatch = filters.endDate ? new Date(recibo.date) <= new Date(filters.endDate) : true;

            return folioMatch && patientMatch && startDateMatch && endDateMatch;
        });
    }, [recibos, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleEditResults = (id: number) => {
        router.push(`/reporte-resultados/captura/${id}`);
    };

    const handlePrintReport = (id: number) => {
        toast({ title: "Imprimiendo Reporte", description: `Se está generando el reporte para el folio #${id}.`});
        // La lógica de impresión real iría aquí
        // window.print();
    };

    const handleSendEmail = async (recibo: ReciboForTable) => {
        toast({ title: "Info", description: `La funcionalidad de envío de correo para ${recibo.patient_name} está pendiente de implementación.`, variant: "default"});
        // Lógica futura:
        // const fullRecibo = await getReciboById(recibo.id);
        // if (!fullRecibo || !fullRecibo.results || fullRecibo.results.length === 0) { ... }
        // await sendEmailReport(...);
    };


    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileStack className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Reporte de Resultados</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / Reporte de Resultados
                </div>
            </div>

            <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2"><Search /> Búsqueda de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="folio">Folio</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="folio" placeholder="Buscar por folio" className="pl-10" value={filters.folio} onChange={handleFilterChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient">Paciente</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="patient" placeholder="Buscar por nombre" className="pl-10" value={filters.patient} onChange={handleFilterChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha Inicial</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="startDate" type="date" className="pl-10" value={filters.startDate} onChange={handleFilterChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha Final</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="endDate" type="date" className="pl-10" value={filters.endDate} onChange={handleFilterChange} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resultados Encontrados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Cargando resultados...</TableCell>
                                    </TableRow>
                                ) : filteredRecibos.length > 0 ? (
                                    filteredRecibos.map((recibo) => (
                                        <TableRow key={recibo.id}>
                                            <TableCell>#{recibo.id}</TableCell>
                                            <TableCell>{recibo.patient_name}</TableCell>
                                            <TableCell>{new Date(recibo.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    recibo.status === 'cancelled' ? 'bg-red-200 text-red-800' : recibo.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                    {recibo.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="icon" title="Capturar / Editar Resultados" onClick={() => handleEditResults(recibo.id)}>
                                                        <FilePenLine className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" title="Imprimir Reporte" onClick={() => handlePrintReport(recibo.id)}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" title="Enviar por Correo" onClick={() => handleSendEmail(recibo)}>
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No se encontraron resultados para los filtros aplicados.</TableCell>
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
