"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Microscope, DollarSign, Save, Trash2, FlaskConical, BriefcaseMedical } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { getPatients, Patient } from "@/services/patientService";
import { getStudies, Service } from "@/services/studyService";
import { getDoctors, Doctor } from "@/services/doctorService";
import { createRecibo } from "@/services/reciboService";

type CartItem = Service & { quantity: number };

export default function CreateTestRequestPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paidAmount, setPaidAmount] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [patientsData, servicesData, doctorsData] = await Promise.all([
                    getPatients(),
                    getStudies(),
                    getDoctors(),
                ]);
                setPatients(patientsData);
                setServices(servicesData);
                setDoctors(doctorsData);
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
            return toast({ title: "Atención", description: "Este artículo ya está en la solicitud.", variant: "destructive" });
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
    const due = total - paidAmount;

    const handleSaveRequest = async () => {
        if (!selectedPatientId || cart.length === 0) {
            return toast({
                title: "Faltan datos",
                description: "Por favor, seleccione un paciente y añada al menos un estudio.",
                variant: "destructive"
            });
        }
        setLoading(true);

        try {
            const reciboData = {
                patient_id: Number(selectedPatientId),
                doctor_id: selectedDoctorId ? Number(selectedDoctorId) : null,
                branch_id: 1, // Asumir sucursal principal por defecto
                created_by_id: 1, // Asumir usuario admin por defecto
                subtotal: subtotal,
                discount: 0,
                total: total,
                paid: paidAmount,
                details: cart.map(item => ({
                    item_type: 'SERVICE' as 'SERVICE',
                    item_id: item.id,
                    price: item.price || 0,
                    quantity: item.quantity,
                }))
            };

            const newReciboId = await createRecibo(reciboData);

            toast({
                title: "Éxito",
                description: `La solicitud #${newReciboId} ha sido guardada correctamente.`
            });
            router.push('/entrega-resultados'); // O a donde sea apropiado

        } catch (error) {
            console.error("Error saving request:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la solicitud.",
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
                    <FlaskConical className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Solicitud de Exámenes</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / Solicitud de Exámenes
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader><CardTitle>1. Seleccione Paciente y Estudios</CardTitle></CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Paciente*</Label>
                                    <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar un paciente..." /></SelectTrigger>
                                        <SelectContent>
                                            {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Médico (Opcional)</Label>
                                    <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar un médico..." /></SelectTrigger>
                                        <SelectContent>
                                            {doctors.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Añadir Estudio o Paquete*</Label>
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
                        <CardHeader><CardTitle>2. Carrito de Solicitud</CardTitle></CardHeader>
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
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Añada estudios a la solicitud</TableCell>
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
                        <CardHeader><CardTitle>3. Resumen y Pago</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             {selectedPatient ? (
                                <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
                                    <User className="text-primary"/>
                                    <span className="font-semibold">{selectedPatient.name}</span>
                                </div>
                             ) : (
                                <p className="text-muted-foreground text-center py-4">Seleccione un paciente</p>
                             )}
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                            </div>
                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="paidAmount">Monto Pagado</Label>
                                <Input
                                    id="paidAmount"
                                    type="number"
                                    placeholder="0.00"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                                />
                            </div>
                             <div className="flex justify-between font-bold text-lg text-red-600">
                                <span>Adeudo:</span>
                                <span>${due.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" disabled={!selectedPatientId || cart.length === 0 || loading} onClick={handleSaveRequest}>
                                <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Solicitud'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
