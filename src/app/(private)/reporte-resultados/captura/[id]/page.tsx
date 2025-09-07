"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getReciboById, Recibo, TestResult, saveResults } from "@/services/reciboService";
import { getStudies, Study } from "@/services/studyService";
import { FileStack, Save, User, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

type ResultInput = {
    studyName: string;
    parameterName?: string; // Optional for studies without parameters
    result: string;
    reference: string;
    unit: string;
};

export default function CaptureResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const reciboId = params.id as string;

    const [recibo, setRecibo] = useState<Recibo | null>(null);
    const [allStudies, setAllStudies] = useState<Study[]>([]);
    const [results, setResults] = useState<ResultInput[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reciboId) {
            Promise.all([
                getReciboById(reciboId),
                getStudies()
            ]).then(([reciboData, studiesData]) => {
                if (reciboData) {
                    setRecibo(reciboData);
                    setAllStudies(studiesData);

                    const initialResults: ResultInput[] = [];
                    const studiesInRecibo = studiesData.filter(s => reciboData.studies.includes(s.name));

                    studiesInRecibo.forEach(study => {
                        if (study.parameters && study.parameters.length > 0) {
                            study.parameters.forEach(param => {
                                const existingResult = reciboData.results?.find(r => r.studyName === study.name && r.parameterName === param.name);
                                initialResults.push({
                                    studyName: study.name,
                                    parameterName: param.name,
                                    result: existingResult?.result || '',
                                    reference: existingResult?.reference || param.referenceType || '', // Fallback to parameter default
                                    unit: param.unit || ''
                                });
                            });
                        } else {
                            // Handle studies without parameters
                            const existingResult = reciboData.results?.find(r => r.studyName === study.name && !r.parameterName);
                            initialResults.push({
                                studyName: study.name,
                                parameterName: '',
                                result: existingResult?.result || '',
                                reference: existingResult?.reference || '',
                                unit: ''
                            });
                        }
                    });
                    setResults(initialResults);

                } else {
                    toast({ title: "Error", description: "Solicitud no encontrada.", variant: "destructive" });
                    router.push('/reporte-resultados');
                }
            }).catch(err => {
                console.error("Error fetching data:", err);
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            }).finally(() => setLoading(false));
        }
    }, [reciboId, router, toast]);

    const handleResultChange = (index: number, field: keyof ResultInput, value: string) => {
        const newResults = [...results];
        (newResults[index] as any)[field] = value;
        setResults(newResults);
    };

    const handleSaveChanges = async () => {
        if (!recibo) return;
        try {
            // Map ResultInput[] to TestResult[] before saving
            const resultsToSave: TestResult[] = results.map(r => ({
                studyName: r.studyName,
                parameterName: r.parameterName || '',
                result: r.result,
                reference: r.reference,
                unit: r.unit,
            }));
            await saveResults(recibo.id, resultsToSave);
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
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/reporte-resultados" className="hover:text-primary">Entrega de Resultados</Link> / Captura
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
                                    <TableHead>Estudio / Parámetro</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Unidades</TableHead>
                                    <TableHead>Valores de Referencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {results.map((result, index) => (
                                   <TableRow key={index}>
                                       <TableCell className="font-medium">
                                           {result.parameterName ? (
                                               <div className="pl-4">{result.parameterName}</div>
                                           ) : (
                                               <strong>{result.studyName}</strong>
                                           )}
                                       </TableCell>
                                       <TableCell>
                                           <Input
                                               value={result.result}
                                               onChange={(e) => handleResultChange(index, 'result', e.target.value)}
                                               placeholder="Ingrese resultado"
                                            />
                                       </TableCell>
                                       <TableCell>
                                            <Input
                                                value={result.unit}
                                                onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                                                placeholder="Unidad"
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
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        <Save className="mr-2 h-4 w-4"/> {loading ? "Guardando..." : "Guardar Resultados"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
