
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Newspaper, User, Microscope, DollarSign, Tag, Save, Package, Trash2 } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { getStudies, Study } from "@/services/studyService";
import { getPaquetesEstudios, Paquetes as PackageType } from "@/services/packageService";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getQuoteById, updateQuote } from "@/services/quoteService";
import Link from "next/link";

type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'study' | 'package';
};

export default function EditQuotePage() {
    const [estudios, setStudies] = useState<Study[]>([]);
    const [paquetes, setPackages] = useState<PackageType[]>([]);
    
    const [nombrePaciente, setPatientName] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const quoteId = params.id as string;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [estudiosData, paquetesData, quoteData] = await Promise.all([
                    getStudies(),
                    getPaquetesEstudios(),
                    getQuoteById(quoteId),
                ]);
                setStudies(estudiosData);
                setPackages(paquetesData);

                if (quoteData) {
                    setPatientName(quoteData.paciente_nombre);
                    const initialCart: CartItem[] = [];
                    quoteData.estudios?.forEach((studyName: any) => {
                        const study = estudiosData.find((s: { nombre: any; }) => s.nombre === studyName);
                        if(study) initialCart.push({ id: String(study.id), name: study.nombre, price: study.precio, type: 'study' });
                    });
                    quoteData.paquetes?.forEach((packageName: any) => {
                        const pkg = paquetesData.find((p: { nombre: any; }) => p.nombre === packageName);
                        if(pkg) initialCart.push({ id: String(pkg.id), name: pkg.nombre, price: pkg.precio, type: 'package' });
                    });
                    setCart(initialCart);
                } else {
                    toast({ title: "Error", description: "No se encontró la cotización.", variant: "destructive" });
                    router.push('/cotizaciones');
                }

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos iniciales."});
            } finally {
                setLoading(false);
            }
        };
        if(quoteId) {
            fetchData();
        }
    }, [quoteId, router, toast]);

    const handleAddItemToCart = (itemId: string) => {
        if (!itemId) return;

        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            toast({ title: "Atención", description: "Este artículo ya está en la cotización." });
            return;
        }

        const studyToAdd = estudios.find(s => String(s.id) === itemId);
        if (studyToAdd) {
            setCart(prev => [...prev, {id: itemId, name: studyToAdd.nombre, price: studyToAdd.precio, type: 'study'}]);
            return;
        }

        const packageToAdd = paquetes.find(p => String(p.id) === itemId);
        if (packageToAdd) {
            setCart(prev => [...prev, {id: itemId, name: packageToAdd.nombre, price: packageToAdd.precio, type: 'package'}]);
        }
    };


    const handleRemoveFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);
    const descuento = 0; // Placeholder for descuento logic
    const total = subtotal - descuento;

    const handleUpdateQuote = async () => {
        if (cart.length === 0) {
            toast({
                title: "Faltan datos",
                description: "La cotización no puede estar vacía.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);

        const estudiosInCart = cart.filter(i => i.type === 'study').map(i => i.name);
        const paquetesInCart = cart.filter(i => i.type === 'package').map(i => i.name);

        try {
            const updatedQuote = {
                subtotal,
                descuento,
                total,
                estudios: estudiosInCart,
                paquetes: paquetesInCart,
            };
            
            await updateQuote(quoteId, updatedQuote); 

            toast({
                title: "Éxito",
                description: "La cotización ha sido actualizada correctamente."
            });
            router.push('/cotizaciones');

        } catch (error) {
            console.error("Error updating quote:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la cotización. Por favor, intente de nuevo.",
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
    
    if (loading) {
        return <div>Cargando...</div>
    }

    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Editar Cotización</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/cotizaciones" className="hover:text-primary">Cotizaciones</Link> / Editar
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Estudios en la Cotización</CardTitle>
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
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="capitalize">{item.type === 'study' ? 'Estudio' : 'Paquete'}</TableCell>
                                                <TableCell className="text-right">${Number(item.price.toFixed(2))}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveFromCart(item.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">Añada estudios o paquetes a la cotización</TableCell>
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
                            <CardTitle>Detalles de la Cotización</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="text-primary"/>
                                <span>{nombrePaciente}</span>
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
                                <span>${Number(subtotal.toFixed(2))}</span>
                            </div>
                                <div className="flex justify-between items-center text-lg">
                                <span className="flex items-center gap-2"><Tag className="h-5 w-5"/> Descuento</span>
                                <span>${Number(descuento.toFixed(2))}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-xl text-primary">
                                <span className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Total</span>
                                <span>${Number(total.toFixed(2))}</span>
                            </div>
                            <Button className="w-full" size="lg" disabled={cart.length === 0 || loading} onClick={handleUpdateQuote}>
                                <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
