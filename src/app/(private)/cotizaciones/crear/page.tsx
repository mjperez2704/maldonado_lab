"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Microscope, DollarSign, Save, Trash2, Newspaper } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { getPatients, Patient } from "@/services/patientService";
import { getStudies, Service } from "@/services/studyService"; // 'getStudies' ahora trae todos los 'services'
import { createQuote } from "@/services/quoteService";
import {Label} from "recharts";

// El tipo del carrito ahora contiene el objeto Service completo
type CartItem = Service & { quantity: number };

export default function CreateQuotePage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [services, setServices] = useState<Service[]>([]); // Unificado: estudios, paquetes, etc.

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [patientsData, servicesData] = await Promise.all([
                    getPatients(),
                    getStudies(),
                ]);
                setPatients(patientsData);
                setServices(servicesData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos iniciales.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleAddItemToCart = (serviceId: string) => {
        if (!serviceId) return;
        const id = Number(serviceId);

        if (cart.some(item => item.id === id)) {
            return toast({ title: "Atención", description: "Este artículo ya está en la cotización.", variant: "destructive" });
        }

        const serviceToAdd = services.find(s => s.id === id);
        if (serviceToAdd) {
            setCart(prev => [...prev, { ...serviceToAdd, quantity: 1 }]);
        }
    };

    const handleRemoveFromCart = (serviceId: number) => {
        setCart(prev => prev.filter(item => item.id !== serviceId));
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0), [cart]);
    const total = subtotal; // Lógica de descuento puede añadirse aquí

    const handleSaveQuote = async () => {
        if (!selectedPatientId || cart.length === 0) {
            return toast({
                title: "Faltan datos",
                description: "Por favor, seleccione un paciente y añada al menos un estudio.",
                variant: "destructive"
            });
        }
        setLoading(true);

        try {
            // Construir el objeto de datos como lo espera el nuevo servicio
            const quoteData = {
                patient_id: Number(selectedPatientId),
                created_by_id: 1, // Asumir ID 1 del usuario logueado (Admin)
                total: total,
                details: cart.map(item => ({
                    item_type: 'SERVICE' as 'SERVICE', // Por ahora solo manejamos servicios
                    item_id: item.id,
                    price: item.price || 0,
                    quantity: item.quantity,
                }))
            };

            await createQuote(quoteData);

            toast({
                title: "Éxito",
                description: "La cotización ha sido guardada correctamente."
            });
            router.push('/cotizaciones');

        } catch (error) {
            console.error("Error saving quote:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la cotización.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));

    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Crear Cotización</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/cotizaciones" className="hover:text-primary">Cotizaciones</Link> / Crear
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader><CardTitle>1. Seleccione Paciente y Estudios</CardTitle></CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Paciente</Label>
                                <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar un paciente..." /></SelectTrigger>
                                    <SelectContent>
                                        {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Añadir Estudio o Paquete</Label>
                                <Select onValueChange={handleAddItemToCart} disabled={!selectedPatientId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar un servicio..." /></SelectTrigger>
                                    <SelectContent>
                                        {services.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} - ${s.price?.toFixed(2)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>2. Estudios en la Cotización</CardTitle></CardHeader>
                        <CardContent>
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Estudio/Paquete</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.length > 0 ? cart.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.type}</TableCell>
                                                <TableCell className="text-right">${(item.price || 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveFromCart(item.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Añada estudios a la cotización</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
                     <Card>
                        <CardHeader><CardTitle>3. Resumen</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             {selectedPatient ? (
                                <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                                    <User className="text-primary"/>
                                    <span className="font-semibold">{selectedPatient.name}</span>
                                </div>
                             ) : (
                                <p className="text-muted-foreground text-center py-8">Seleccione un paciente</p>
                             )}
                            <div className="flex justify-between items-center font-bold text-xl text-primary border-t pt-4">
                                <span className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" disabled={!selectedPatientId || cart.length === 0 || loading} onClick={handleSaveQuote}>
                                <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Cotización'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
