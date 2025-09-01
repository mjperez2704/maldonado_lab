"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getReciboById, Recibo, TestResult, saveResults } from "@/services/reciboService";
import { FileStack, Save, User, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CaptureResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const reciboId = params.id as string;

    const [recibo, setRecibo] = useState<Recibo | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reciboId) {
            getReciboById(reciboId).then(data => {
                if (data) {
                    setRecibo({
                        ...data,
                        status: (data.status as Recibo['status']) || 'pending', // Provide a default value for undefined status
                    });
                    // Initialize results state based on studies in the receipt
                    const initialResults = data.studies?.map((studyName: string) => {
                        const existingResult = data.results?.find((r: TestResult) => r.studyName === studyName);
                        return existingResult || { studyName, result: '', reference: '' };
                    }) || [];
                    setResults(initialResults);
                } else {
                    toast({ title: "Error", description: "Solicitud no encontrada.", variant: "destructive" });
                    router.push('/reporte-resultados');
                }
            }).finally(() => setLoading(false));
        }
    }, [reciboId, router, toast]);

    const handleResultChange = (index: number, field: keyof TestResult, value: string) => {
        const newResults = [...results];
        (newResults[index] as any)[field] = value;
        setResults(newResults);
    };

    const handleSaveChanges = async () => {
        if (!recibo) return;
        try {
            await saveResults(recibo.id, results);
            toast({ title: "Éxito", description: "Resultados guardados correctamente."});
            router.push('/reporte-resultados');
        } catch (error) {
            console.error("Error saving results:", error);
            toast({ title: "Error", description: "No se pudieron guardar los resultados.", variant: "destructive"});
        }
    }

    if (loading) {
        return <div>Cargando información de la solicitud...</div>
    }

    if (!recibo) {
        return <div>No se encontró la solicitud.</div>
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
                        <strong>Folio:</strong> {recibo.barcode}
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="text-primary"/>
                        <strong>Paciente:</strong> {recibo.patientName}
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
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Valores de Referencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {results.map((result, index) => (
                                   <TableRow key={index}>
                                       <TableCell className="font-medium">{result.studyName}</TableCell>
                                       <TableCell>
                                           <Input
                                               value={result.result}
                                               onChange={(e) => handleResultChange(index, 'result', e.target.value)}
                                               placeholder="Ingrese resultado"
                                            />
                                       </TableCell>
                                       <TableCell>
                                            <Input
                                               value={result.reference}
                                               onChange={(e) => handleResultChange(index, 'reference', e.target.value)}
                                               placeholder="Ej. 70-110 mg/dL"
                                            />
                                       </TableCell>
                                   </TableRow>
                               ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4"/> Guardar Resultados
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
