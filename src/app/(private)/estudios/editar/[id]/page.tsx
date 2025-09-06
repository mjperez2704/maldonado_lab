"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Microscope, Plus, Trash2, Save } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Importar las nuevas interfaces y funciones del servicio refactorizado
import {
    updateStudy,
    getStudyById,
    getStudies as getAllStudies,
    StudyDetails,
    ServiceParameter,
    StudySample,
    PackageItem,
    Service
} from "@/services/studyService";
import { getCategories, Category } from "@/services/categoryService";

export default function EditStudyPage() {
    const router = useRouter();
    const params = useParams();
    const studyId = Number(params.id);
    const { toast } = useToast();

    const [formData, setFormData] = useState<StudyDetails | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allStudies, setAllStudies] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para los formularios de sub-elementos
    const [newParam, setNewParam] = useState<Omit<ServiceParameter, 'id' | 'service_id'>>({ name: '', unit: '', reference_value: '', order: 0 });
    const [newSample, setNewSample] = useState<Omit<StudySample, 'id' | 'service_id'>>({ type: '', container: '', indications: '' });
    const [studySearchTerm, setStudySearchTerm] = useState('');

    useEffect(() => {
        if (!studyId) return;
        const fetchData = async () => {
            try {
                const [studyData, cats, studies] = await Promise.all([
                    getStudyById(studyId),
                    getCategories(),
                    getAllStudies()
                ]);

                if (studyData) {
                    setFormData(studyData);
                } else {
                    toast({ title: "Error", description: "Estudio no encontrado.", variant: "destructive" });
                    router.push('/estudios');
                }
                setCategories(cats);
                setAllStudies(studies);
            } catch (error) {
                console.error("Error fetching dependencies", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos para la edición.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studyId, router, toast]);

    if (loading) {
        return <div className="flex justify-center items-center h-full">Cargando datos del estudio...</div>;
    }

    if (!formData) {
        return <div className="flex justify-center items-center h-full">Estudio no encontrado.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => prev ? { ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value } : null);
    };

    const handleSelectChange = (id: keyof StudyDetails, value: string | number | null) => {
        setFormData(prev => prev ? { ...prev, [id]: value } : null);
    };

    // --- Lógica de Parámetros ---
    const handleAddParameter = () => {
        if (!newParam.name) return toast({ title: "Error", description: "El nombre del parámetro es requerido.", variant: "destructive" });
        const newOrder = formData.parameters.length > 0 ? Math.max(...formData.parameters.map(p => p.order || 0)) + 1 : 1;
        setFormData(prev => prev ? { ...prev, parameters: [...prev.parameters, { ...newParam, order: newOrder }] } : null);
        setNewParam({ name: '', unit: '', reference_value: '', order: 0 });
    };

    const handleRemoveParameter = (index: number) => {
        setFormData(prev => prev ? { ...prev, parameters: prev.parameters.filter((_, i) => i !== index) } : null);
    };

    // --- Lógica de Muestras ---
    const handleAddSample = () => {
        if (!newSample.type) return toast({ title: "Error", description: "El tipo de muestra es requerido.", variant: "destructive" });
        setFormData(prev => prev ? { ...prev, samples: [...prev.samples, newSample] } : null);
        setNewSample({ type: '', container: '', indications: '' });
    };

    const handleRemoveSample = (index: number) => {
        setFormData(prev => prev ? { ...prev, samples: prev.samples.filter((_, i) => i !== index) } : null);
    };

    // --- Lógica de Paquetes ---
    const filteredStudies = allStudies.filter(study =>
        study.id !== formData.id &&
        study.type !== 'PAQUETE' &&
        (study.name.toLowerCase().includes(studySearchTerm.toLowerCase()) ||
         (study.code || '').toLowerCase().includes(studySearchTerm.toLowerCase())) &&
        !formData.packageItems?.some(pi => pi.item_id === study.id)
    ).slice(0, 10);

    const addPackageItem = (study: Service) => {
        const newItem: PackageItem = { item_type: 'SERVICE', item_id: study.id, quantity: 1 };
        setFormData(prev => prev ? { ...prev, packageItems: [...(prev.packageItems || []), newItem] } : null);
        setStudySearchTerm('');
    };

    const removePackageItem = (itemId: number) => {
        setFormData(prev => prev ? { ...prev, packageItems: (prev.packageItems || []).filter(pi => pi.item_id !== itemId) } : null);
    };

    // --- Envío del Formulario ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category_id) {
            return toast({ title: "Campos requeridos", description: "Por favor, complete Nombre y Categoría.", variant: "destructive" });
        }
        setLoading(true);
        try {
            await updateStudy(formData.id, formData);
            toast({ title: "Éxito", description: "Estudio actualizado correctamente." });
            router.push('/estudios');
        } catch (error) {
            console.error("Error updating study:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estudio.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <Microscope className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold text-primary">Estudios</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/estudios" className="hover:text-primary">Estudios</Link> / Editar Estudio
                </div>
            </div>

            <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Datos Generales del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="name">Nombre*</Label><Input id="name" value={formData.name} onChange={handleChange} required /></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="code">Código</Label><Input id="code" value={formData.code || ''} onChange={handleChange} /></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="price">Precio</Label><Input id="price" type="number" value={formData.price || 0} onChange={handleChange} /></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="type">Tipo de Servicio*</Label><Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v as 'ESTUDIO' | 'CULTIVO' | 'PAQUETE')} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ESTUDIO">Estudio</SelectItem><SelectItem value="CULTIVO">Cultivo</SelectItem><SelectItem value="PAQUETE">Paquete</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="category_id">Categoría*</Label><Select value={String(formData.category_id || '')} onValueChange={(v) => handleSelectChange('category_id', Number(v))} required><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="method">Método</Label><Input id="method" value={formData.method || ''} onChange={handleChange} /></div>
                    <div className="space-y-2 lg:col-span-2"><Label>Tiempo de entrega</Label><div className="flex gap-2"><Input id="delivery_time" type="number" className="w-1/2" value={formData.delivery_time || 0} onChange={handleChange} /><Select value={formData.delivery_unit || 'dias'} onValueChange={(v) => handleSelectChange('delivery_unit', v as 'dias' | 'horas')}><SelectTrigger className="w-1/2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="horas">Horas</SelectItem><SelectItem value="dias">Días</SelectItem></SelectContent></Select></div></div>
                    <div className="lg:col-span-4 space-y-2"><Label htmlFor="indications">Indicaciones</Label><Textarea id="indications" value={formData.indications || ''} onChange={handleChange} /></div>
                </CardContent>
            </Card>

            <Tabs defaultValue="parameters">
                <TabsList>
                    <TabsTrigger value="parameters">Parámetros</TabsTrigger>
                    <TabsTrigger value="samples">Muestras</TabsTrigger>
                    {formData.type === 'PAQUETE' && <TabsTrigger value="packageItems">Estudios del Paquete</TabsTrigger>}
                </TabsList>

                <TabsContent value="parameters" className="pt-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Parámetros del Estudio</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Parámetro</TableHead><TableHead>Unidad</TableHead><TableHead>Valor de Referencia</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {formData.parameters.map((param, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{param.name}</TableCell><TableCell>{param.unit}</TableCell><TableCell>{param.reference_value}</TableCell>
                                                <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveParameter(index)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label>Parámetro</Label><Input value={newParam.name} onChange={(e) => setNewParam(p => ({ ...p, name: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Unidad</Label><Input value={newParam.unit || ''} onChange={(e) => setNewParam(p => ({ ...p, unit: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Valor de Referencia</Label><Input value={newParam.reference_value || ''} onChange={(e) => setNewParam(p => ({ ...p, reference_value: e.target.value }))} /></div>
                                <Button type="button" onClick={handleAddParameter}><Plus className="mr-2 h-4 w-4" /> Agregar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="samples" className="pt-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Muestras Requeridas</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Table>
                                <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Contenedor</TableHead><TableHead>Indicaciones</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {formData.samples.map((sample, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{sample.type}</TableCell><TableCell>{sample.container}</TableCell><TableCell>{sample.indications}</TableCell>
                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSample(index)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label>Tipo de Muestra</Label><Input value={newSample.type} onChange={(e) => setNewSample(s => ({ ...s, type: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Contenedor</Label><Input value={newSample.container || ''} onChange={(e) => setNewSample(s => ({ ...s, container: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Indicaciones</Label><Input value={newSample.indications || ''} onChange={(e) => setNewSample(s => ({ ...s, indications: e.target.value }))} /></div>
                                <Button type="button" onClick={handleAddSample}><Plus className="mr-2 h-4 w-4" /> Agregar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {formData.type === 'PAQUETE' && (
                    <TabsContent value="packageItems" className="pt-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Estudios Incluidos en el Paquete</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Estudio</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {formData.packageItems.map((item) => {
                                            const study = allStudies.find(s => s.id === item.item_id);
                                            return (
                                                <TableRow key={item.item_id}>
                                                    <TableCell>{study?.name || `ID: ${item.item_id}`}</TableCell>
                                                    <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removePackageItem(item.item_id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                <div className="p-4 border rounded-md space-y-2">
                                    <Label>Buscar Estudio para Agregar</Label>
                                    <Input value={studySearchTerm} onChange={(e) => setStudySearchTerm(e.target.value)} placeholder="Buscar por nombre o código..." />
                                    {studySearchTerm && (
                                        <div className="border rounded-md max-h-40 overflow-y-auto">
                                            {filteredStudies.map(study => (
                                                <div key={study.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => addPackageItem(study)}>
                                                    {study.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                    {loading ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
                </Button>
            </div>
        </form>
    );
}
