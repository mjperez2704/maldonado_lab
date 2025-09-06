"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileStack, Save, User, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { getReciboById, saveResults, ReciboView, ReciboResult } from "@/services/reciboService";

export default function CaptureResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const reciboId = Number(params.id);

    const [recibo, setRecibo] = useState<ReciboView | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reciboId) {
            getReciboById(reciboId)
                .then(reciboData => {
                    if (reciboData) {
                        setRecibo(reciboData);
                    } else {
                        toast({ title: "Error", description: "Solicitud no encontrada.", variant: "destructive" });
                        router.push('/reporte-resultados');
                    }
                })
                .catch(err => {
                    console.error("Error fetching data:", err);
                    toast({ title: "Error", description: "No se pudieron cargar los datos de la solicitud.", variant: "destructive" });
                })
                .finally(() => setLoading(false));
        }
    }, [reciboId, router, toast]);

    const handleResultChange = (detailIndex: number, paramIndex: number, value: string) => {
        if (!recibo) return;

        // Actualización inmutable del estado anidado
        const updatedRecibo = { ...recibo };
        const updatedDetails = [...updatedRecibo.details];
        const updatedDetail = { ...updatedDetails[detailIndex] };
        const updatedParameters = [...(updatedDetail.parameters || [])];
        updatedParameters[paramIndex] = { ...updatedParameters[paramIndex], result: value };

        updatedDetail.parameters = updatedParameters;
        updatedDetails[detailIndex] = updatedDetail;
        updatedRecibo.details = updatedDetails;

        setRecibo(updatedRecibo);
    };

    const handleSaveChanges = async () => {
        if (!recibo) return;
        setLoading(true);

        try {
            // Transformar los datos del estado al formato que espera el servicio
            const resultsToSave: Omit<ReciboResult, 'id' | 'validated_at' | 'validated_by_id'>[] = [];
            recibo.details.forEach(detail => {
                detail.parameters?.forEach(param => {
                    if (param.result !== null && param.result !== undefined && param.result !== '') {
                        resultsToSave.push({
                            recibo_detail_id: detail.id,
                            parameter_id: param.id,
                            result: param.result,
                        });
                    }
                });
            });

            await saveResults(recibo.id, resultsToSave);
            toast({ title: "Éxito", description: "Resultados guardados correctamente." });
            router.push('/reporte-resultados');
        } catch (error) {
            console.error("Error saving results:", error);
            toast({ title: "Error", description: "No se pudieron guardar los resultados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">Cargando información de la solicitud...</div>;
    }

    if (!recibo) {
        return <div className="flex justify-center items-center h-full">No se encontró la solicitud.</div>;
    }

    return (
        <div className="flex flex-col gap-6 py-8">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileStack className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Captura de Resultados</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/reporte-resultados" className="hover:text-primary">Reporte de Resultados</Link> / Captura
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Información del Paciente y Solicitud</CardTitle>
                    <CardDescription>Revise los datos y proceda a la captura de resultados.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <Hash className="text-primary"/>
                        <strong>Folio:</strong> #{recibo.id}
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="text-primary"/>
                        <strong>Paciente:</strong> {recibo.patient_name}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="text-primary"/>
                        <strong>Fecha Solicitud:</strong> {new Date(recibo.date).toLocaleDateString()}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resultados de los Estudios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estudio</TableHead>
                                    <TableHead>Parámetro</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Valores de Referencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {recibo.details.flatMap((detail, detailIndex) =>
                                   detail.parameters && detail.parameters.length > 0 ? (
                                       detail.parameters.map((param, paramIndex) => (
                                           <TableRow key={`${detail.id}-${param.id}`}>
                                               <TableCell className="font-medium">{detail.item_name}</TableCell>
                                               <TableCell>{param.name}</TableCell>
                                               <TableCell>
                                                   <Input
                                                       value={param.result || ''}
                                                       onChange={(e) => handleResultChange(detailIndex, paramIndex, e.target.value)}
                                                       placeholder="Ingrese resultado"
                                                    />
                                               </TableCell>
                                               <TableCell>{param.reference_value}</TableCell>
                                           </TableRow>
                                       ))
                                   ) : (
                                    // Renderiza una fila para estudios sin parámetros predefinidos
                                    <TableRow key={`${detail.id}-no-params`}>
                                        <TableCell className="font-medium">{detail.item_name}</TableCell>
                                        <TableCell>Resultado General</TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="Ingrese resultado"
                                                // Aquí se necesitaría una lógica para manejar resultados que no están ligados a un parámetro
                                            />
                                        </TableCell>
                                        <TableCell>N/A</TableCell>
                                    </TableRow>
                                   )
                               )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        <Save className="mr-2 h-4 w-4"/> {loading ? 'Guardando...' : 'Guardar Resultados'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
