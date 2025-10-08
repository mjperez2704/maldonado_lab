
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, UserSearch, Search, Trash2, Calendar, User, Microscope, DollarSign, Tag, Save, Package } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { getPatients, Paciente } from "@/services/pacienteServicio";
import { getStudies, Estudio } from "@/services/estudiosServicio";
import { getPaquetesEstudios, Paquetes as PackageType } from "@/services/paquetesServicio";
import { getDoctores, Doctor } from "@/services/doctoresServicio";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getReciboById, updateRecibo, Recibo } from "@/services/recibosServicio";
import Link from "next/link";

type CartItem = {
    id: string;
    nombre: string;
    price: number;
    type: 'study' | 'package';
};

export default function EditTestRequestPage() {
    const router = useRouter();
    const params = useParams();
    const reciboId = params.id as string;

    const [estudios, setStudies] = useState<Estudio[]>([]);
    const [paquetes, setPackages] = useState<PackageType[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    
    const [recibo, setRecibo] = useState<Recibo | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');

    const [loading, setLoading] = useState(true);
    const { toast } = useToast();


    useEffect(() => {
        const fetchData = async () => {
            if (!reciboId) return;
            try {
                const [reciboData, estudiosData, doctorsData, paquetesData] = await Promise.all([
                    getReciboById(reciboId),
                    getStudies(),
                    getDoctores(),
                    getPaquetesEstudios(),
                ]);
                
                if (reciboData) {
                    setRecibo(reciboData);
                    setStudies(estudiosData);
                    setDoctors(doctorsData);
                    setPackages(paquetesData);

                    const initialCart: CartItem[] = [];
                    reciboData.estudios.forEach((studyName: any) => {
                        const study = estudiosData.find((s: { nombre: any; }) => s.nombre === studyName);
                        if (study) initialCart.push({ id: String(study.id), nombre: study.nombre, price: Number(study.precio), type: 'study' });
                    });
                    reciboData.paquetes.forEach((packageName: any) => {
                        const pkg = paquetesData.find((p: { nombre: any; }) => p.nombre === packageName);
                        if (pkg) initialCart.push({ id: String(pkg.id), nombre: pkg.nombre, price: Number(pkg.precio), type: 'package' });
                    });
                    setCart(initialCart);
                    
                    setSelectedDoctor(reciboData.doctor || '');
                    setDeliveryDate(reciboData.deliveryDate ? new Date(reciboData.deliveryDate).toISOString().split('T')[0] : '');
                } else {
                    toast({ title: "Error", description: "Solicitud no encontrada."});
                    router.push('/solicitud-examenes');
                }

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos."});
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reciboId, toast, router]);


    const handleAddItemToCart = (itemId: string) => {
        if (!itemId) return;
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            toast({ title: "Atención", description: "Este artículo ya está en la solicitud.", variant: "default" });
            return;
        }

        const studyToAdd = estudios.find(s => String(s.id) === itemId);
        if (studyToAdd) {
            setCart(prev => [...prev, {id: String(studyToAdd.id), nombre: studyToAdd.nombre, price: Number(studyToAdd.precio), type: 'study'}]);
            return;
        }

        const packageToAdd = paquetes.find(p => String(p.id) === itemId);
        if (packageToAdd) {
            setCart(prev => [...prev, {id: String(packageToAdd.id), nombre: packageToAdd.nombre, price: Number(packageToAdd.precio), type: 'package'}]);
        }
    };

    const handleRemoveFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);
    const descuento = 0;
    const total = subtotal - descuento;

    const handleUpdateRequest = async () => {
        if (!recibo || cart.length === 0 || !deliveryDate) {
            toast({
                title: "Faltan datos",
                description: "La solicitud debe tener estudios y una fecha de entrega.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);

        try {
            const updatedData: Partial<Omit<Recibo, 'id'>> = {
                ...recibo,
                estudios: cart.filter(i => i.type === 'study').map(i => i.nombre),
                paquetes: cart.filter(i => i.type === 'package').map(i => i.nombre),
                doctor: selectedDoctor,
                deliveryDate,
                subtotal,
                descuento,
                total,
                adeudo: total - recibo.pagado, // Recalculate adeudo amount
            };
            
            await updateRecibo(recibo.id, updatedData);

            toast({
                title: "Éxito",
                description: "La solicitud de examen ha sido actualizada correctamente."
            });
            router.push('/solicitud-examenes');

        } catch (error) {
            console.error("Error updating request:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la solicitud.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

     const availableItems = useMemo(() => {
        const studyItems = estudios.map(s => ({ value: String(s.id), label: `${s.nombre} ($${s.precio})`, type: 'Estudio' }));
        const packageItems = paquetes.map(p => ({ value: String(p.id), label: `${p.nombre} ($${p.precio})`, type: 'Paquete' }));
        return [...studyItems, ...packageItems];
    }, [estudios, paquetes]);
    
    if (loading) return <div>Cargando...</div>;
    if (!recibo) return <div>Solicitud no encontrada.</div>;

    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FlaskConical className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Editar Solicitud de Examen</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/solicitud-examenes" className="hover:text-primary">Solicitud de Exámenes</Link> / Editar
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estudios en la Solicitud</CardTitle>
                        </CardHeader>
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
                                            <TableRow key={`${item.id}-${item.type}`}>
                                                <TableCell>{item.nombre}</TableCell>
                                                <TableCell className="capitalize">{item.type === 'study' ? 'Estudio' : 'Paquete'}</TableCell>
                                                <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveFromCart(item.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">Añada estudios o paquetes a la solicitud</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 flex items-end gap-4">
                                <div className="flex-grow space-y-2">
                                    <Label>Añadir Estudio o Paquete</Label>
                                    <Select onValueChange={handleAddItemToCart}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Buscar estudio o paquete por nombre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableItems.map(item => (
                                                <SelectItem key={`${item.value}-${item.type}`} value={item.value}>
                                                    {item.label} ({item.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles de la Solicitud</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="text-primary"/>
                                <span>{recibo.nombrePaciente}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Convenio: {recibo.contract || 'Ninguno'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Médico</Label>
                                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar Médico"/></SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(doctor => (
                                            <SelectItem key={doctor.id} value={doctor.nombre}>{doctor.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Entrega</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-10" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="flex items-center gap-2"><Microscope className="h-5 w-5"/> Subtotal</span>
                                <span>${Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="flex items-center gap-2"><Tag className="h-5 w-5"/> Descuento</span>
                                <span>${Number(descuento).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-xl text-primary">
                                <span className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Total</span>
                                <span>${Number(total).toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" disabled={cart.length === 0 || !deliveryDate || loading} onClick={handleUpdateRequest}>
                                <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
