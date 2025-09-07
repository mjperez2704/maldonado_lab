
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, UserSearch, Search, Trash2, Calendar, User, Microscope, DollarSign, Tag, Save, Package, Newspaper } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { getPatients, Patient } from "@/services/patientService";
import { getStudies, Study } from "@/services/studyService";
import { getPackages, Package as PackageType } from "@/services/packageService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createQuote, QuoteCreation } from "@/services/quoteService";
import Link from "next/link";

type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'study' | 'package';
};

export default function CreateQuotePage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [packages, setPackages] = useState<PackageType[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsData, studiesData, packagesData] = await Promise.all([
                    getPatients(),
                    getStudies(),
                    getPackages(),
                ]);
                setPatients(patientsData);
                setStudies(studiesData);
                setPackages(packagesData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos iniciales."});
            }
        };
        fetchData();
    }, [toast]);

    const handleSearchPatient = () => {
        const found = patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPatients(found);
        if (found.length === 1) {
            setSelectedPatient(found[0]);
        } else {
            setSelectedPatient(null);
        }
    };

    const handleSelectPatient = (patientId: string) => {
        const patient = patients.find(p => p.id === Number(patientId));
        if(patient) {
            setSelectedPatient(patient);
            setFilteredPatients([]);
        }
    };

    const handleAddItemToCart = (itemId: string) => {
        if (!itemId) return;

        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            toast({ title: "Atención", description: "Este artículo ya está en la cotización." });
            return;
        }

        const studyToAdd = studies.find(s => String(s.id) === itemId);
        if (studyToAdd) {
            setCart(prev => [...prev, {id: itemId, name: studyToAdd.name, price: studyToAdd.price, type: 'study'}]);
            return;
        }

        const packageToAdd = packages.find(p => String(p.id) === itemId);
        if (packageToAdd) {
            setCart(prev => [...prev, {id: itemId, name: packageToAdd.name, price: packageToAdd.price, type: 'package'}]);
        }
    };


    const handleRemoveFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);
    const discount = 0; // Placeholder for discount logic
    const total = subtotal - discount;

    const resetForm = () => {
        setSearchTerm('');
        setSelectedPatient(null);
        setFilteredPatients([]);
        setCart([]);
    };

    const handleSaveQuote = async () => {
        if (!selectedPatient || cart.length === 0) {
            toast({
                title: "Faltan datos",
                description: "Por favor, seleccione un paciente y añada estudios.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);

        const studiesInCart = cart.filter(i => i.type === 'study').map(i => i.name);
        const packagesInCart = cart.filter(i => i.type === 'package').map(i => i.name);

        try {
            const newQuote: QuoteCreation = {
                patientId: String(selectedPatient.id),
                patientName: selectedPatient.name,
                subtotal,
                discount,
                total,
                studies: studiesInCart,
                packages: packagesInCart,
            };

            await createQuote(newQuote);

            toast({
                title: "Éxito",
                description: "La cotización ha sido guardada correctamente."
            });
            resetForm();
            router.push('/cotizaciones');

        } catch (error) {
            console.error("Error saving quote:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la cotización. Por favor, intente de nuevo.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const availableItems = useMemo(() => {
        const studyItems = studies.map(s => ({ value: s.id, label: `${s.name} ($${s.price})`, type: 'Estudio' }));
        const packageItems = packages.map(p => ({ value: p.id, label: `${p.name} ($${p.price})`, type: 'Paquete' }));
        return [...studyItems, ...packageItems];
    }, [studies, packages]);

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
                        <CardHeader className="bg-primary text-primary-foreground">
                            <CardTitle className="flex items-center gap-2"><UserSearch /> Buscar Paciente</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 flex items-end gap-4">
                            <div className="flex-grow space-y-2">
                                <Label htmlFor="patient-search">Buscar por nombre o número de paciente</Label>
                                <Input
                                    id="patient-search"
                                    placeholder="Escriba aquí..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchPatient(); }}
                                />
                            </div>
                            <Button onClick={handleSearchPatient}><Search className="mr-2"/> Buscar</Button>
                             <Button asChild variant="outline">
                                <Link href="/pacientes/crear">Nuevo Paciente</Link>
                            </Button>
                        </CardContent>
                        {filteredPatients.length > 1 && (
                            <CardContent>
                                <Label>Se encontraron varios pacientes, seleccione uno:</Label>
                                <Select onValueChange={handleSelectPatient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un paciente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredPatients.map(p => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        )}
                    </Card>

                    {selectedPatient && (
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
                                                    <SelectItem key={`${item.value}-${item.type}`} value={String(item.value)}>
                                                        {item.label} ({item.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>Detalles de la Cotización</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {selectedPatient ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <User className="text-primary"/>
                                        <span>{selectedPatient.name}</span>
                                    </div>
                                </>
                             ) : (
                                <p className="text-muted-foreground text-center py-8">Seleccione un paciente para continuar</p>
                             )}
                        </CardContent>
                    </Card>
                    {selectedPatient && (
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
                                    <span>${Number(discount.toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-xl text-primary">
                                    <span className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Total</span>
                                    <span>${Number(total.toFixed(2))}</span>
                                </div>
                                <Button className="w-full" size="lg" disabled={cart.length === 0 || loading} onClick={handleSaveQuote}>
                                    <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Cotización'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
