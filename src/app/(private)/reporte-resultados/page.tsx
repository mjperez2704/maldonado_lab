
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileStack,
  Search,
  Printer,
  FilePenLine,
  Mail,
  Calendar,
  User,
  Hash,
  Eye
} from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { getRecibos, Recibo } from '@/services/reciboService';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendEmailReport } from "@/ai/flows/sendReportFlow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import ReportPreview from "./ReportPreview";


export default function ResultsReportPage() {
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '', startDate: '', endDate: ''});
    const { toast } = useToast();
    const router = useRouter();
    const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
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
            const folioMatch = filters.folio ? recibo.barcode.toLowerCase().includes(filters.folio.toLowerCase()) : true;
            const patientMatch = filters.patient ? recibo.nombrePaciente.toLowerCase().includes(filters.patient.toLowerCase()) : true;
            const startDateMatch = filters.startDate ? new Date(recibo.date) >= new Date(filters.startDate) : true;
            const endDateMatch = filters.endDate ? new Date(recibo.date) <= new Date(filters.endDate) : true;

            return folioMatch && patientMatch && startDateMatch && endDateMatch;
        });
    }, [recibos, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleEditResults = (id: string) => {
        router.push(`/reporte-resultados/captura/${id}`);
    };
    
    const handleShowReport = (recibo: Recibo) => {
        if (!recibo.results || recibo.results.length === 0) {
            toast({ title: "Atención", description: "No hay resultados para mostrar en el reporte.", variant: "default"});
            return;
        }
        setSelectedRecibo(recibo);
        setIsModalOpen(true);
    };

    const handlePrintFromModal = () => {
        const iframe = document.getElementById('report-iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }
    };


    const handleSendEmail = async (recibo: Recibo) => {
        if (!recibo.results || recibo.results.length === 0) {
            toast({ title: "Atención", description: "No hay resultados para enviar.", variant: "destructive"});
            return;
        }

        try {
            const emailContent = await sendEmailReport({
                nombrePaciente: recibo.nombrePaciente,
                results: recibo.results,
            });

            console.log("Generated Email:", emailContent);

            toast({ title: "Correo Enviado", description: `El reporte para ${recibo.nombrePaciente} ha sido generado y enviado (simulado).`});
        } catch (error) {
            console.error("Error sending email:", error);
            toast({ title: "Error", description: "No se pudo generar el correo.", variant: "destructive"});
        }
    };


    return (
        <>
            <div className="flex flex-col gap-6 py-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileStack className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">Entrega de Resultados</h1>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-primary">Hogar</Link> / Entrega de Resultados
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
                                        filteredRecibos.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell>{result.barcode}</TableCell>
                                                <TableCell>{result.nombrePaciente}</TableCell>
                                                <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        result.status === 'cancelled' ? 'bg-red-200 text-red-800' : result.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                                                    }`}>
                                                        {result.status === 'completed' ? 'Completado' : result.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="outline" size="icon" title="Capturar / Editar Resultados" onClick={() => handleEditResults(String(result.id))}>
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" title="Ver Reporte" onClick={() => handleShowReport(result)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" title="Enviar por Correo" onClick={() => handleSendEmail(result)}>
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
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Vista Previa del Reporte de Resultados</DialogTitle>
                    </DialogHeader>
                    {selectedRecibo && (
                        <iframe
                            key={selectedRecibo.id}
                            id="report-iframe"
                            src={`/reporte-resultados/imprimir/${selectedRecibo.id}`}
                            className="w-full h-full border-0"
                            title="Reporte de Resultados"
                        ></iframe>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cerrar</Button>
                        </DialogClose>
                        <Button type="button" onClick={handlePrintFromModal}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
