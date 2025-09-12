
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, UserSearch, Search, Trash2, Calendar, User, Microscope, DollarSign, Tag, Save, Package, PlusSquare, Plus } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { getPatients, Patient } from "@/services/patientService";
import { getStudies, Study } from "@/services/studyService";
import { getPackages, Package as PackageType } from "@/services/packageService";
import { getDoctors, Doctor, createDoctor } from "@/services/doctorService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createRecibo, ReciboCreation } from "@/services/reciboService";
import Link from "next/link";
import { SalesTicket } from "./SalesTicket";
import { CreatePatientForm } from "../../pacientes/CreatePatientForm";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


const doctorSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Correo electrónico no válido." }).optional().or(z.literal('')),
  address: z.string().optional(),
  commission: z.coerce.number().min(0, "La comisión no puede ser negativa.").max(100, "La comisión no puede ser mayor a 100."),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

function CreateDoctorForm({ onSuccess }: { onSuccess: (doctor: Doctor) => void }) {
    const { toast } = useToast();
    
    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: { name: '', phone: '', email: '', address: '', commission: 0 },
    });
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    const onSubmit = async (data: DoctorFormValues) => {
        try {
            const newDoctorData: Omit<Doctor, 'id' | 'code' | 'total' | 'paid' | 'due'> = {
                ...data,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
            };
            await createDoctor(newDoctorData);
            const createdDoctor = { ...newDoctorData, id: Date.now(), code: '', total: 0, paid: 0, due: 0 };
            toast({ title: "Éxito", description: "Doctor creado correctamente." });
            form.reset();
            onSuccess(createdDoctor as Doctor);
        } catch (error) {
            console.error("Error creating doctor:", error);
            toast({ title: "Error", description: "No se pudo crear el doctor.", variant: "destructive" });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="commission" render={({ field }) => (
                        <FormItem><FormLabel>Comisión (%)</FormLabel><FormControl><Input type="number" {...field} onFocus={handleFocus} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <DialogFooter>
                    <Button type="submit">Guardar Doctor</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'study' | 'package';
};

type Discount = {
    type: 'monto' | 'porcentaje';
    value: number;
    reason: string;
};

export default function CreateTestRequestPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [packages, setPackages] = useState<PackageType[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [discountType, setDiscountType] = useState<'monto' | 'porcentaje'>('monto');
    const [discountValue, setDiscountValue] = useState(0);
    const [discountReason, setDiscountReason] = useState('');
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState('A QUIEN CORRESPONDA');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [lastRecibo, setLastRecibo] = useState<ReciboCreation | null>(null);
    
    const { toast } = useToast();
    const router = useRouter();


    const fetchAllData = async () => {
        try {
            const [patientsData, studiesData, doctorsData, packagesData] = await Promise.all([
                getPatients(),
                getStudies(),
                getDoctors(),
                getPackages(),
            ]);
            setPatients(patientsData);
            setStudies(studiesData);
            setDoctors(doctorsData);
            setPackages(packagesData);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast({ title: "Error", description: "No se pudieron cargar los datos iniciales."});
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return [];
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, patients]);

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setSearchTerm(''); // Clear search term after selection
    };

    const handlePatientCreated = async (newPatient: Patient) => {
      setIsPatientModalOpen(false);
      toast({
        title: "Éxito",
        description: `Paciente ${newPatient.name} creado.`,
      });
      await fetchAllData(); // Refresh all data to get the new patient
      setSelectedPatient(newPatient); // Automatically select the new patient
    };
    
    const handleDoctorCreated = async (newDoctor: Doctor) => {
        setIsDoctorModalOpen(false);
        toast({ title: "Éxito", description: `Doctor ${newDoctor.name} creado.` });
        await fetchAllData(); // Refresh doctors list
        setSelectedDoctor(newDoctor.name); // Automatically select the new doctor
    };


    const handleAddItemToCart = (itemId: string) => {
        if (!itemId) return;

        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            toast({ title: "Atención", description: "Este artículo ya está en la solicitud.", variant: "default" });
            return;
        }

        const studyToAdd = studies.find(s => s.id === Number(itemId));
        if (studyToAdd) {
            setCart(prev => [...prev, {id: String(studyToAdd.id), name: studyToAdd.name, price: Number(studyToAdd.price), type: 'study'}]);
            return;
        }

        const packageToAdd = packages.find(p => p.id === Number(itemId));
        if (packageToAdd) {
            setCart(prev => [...prev, {id: String(packageToAdd.id), name: packageToAdd.name, price: Number(packageToAdd.price), type: 'package'}]);
        }
    };


    const handleRemoveFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const handleApplyDiscount = () => {
        if (discountValue <= 0) {
            toast({ title: "Valor inválido", description: "El valor del descuento debe ser mayor a cero.", variant: "destructive" });
            return;
        }
        setDiscount({ type: discountType, value: discountValue, reason: discountReason });
        setIsDiscountModalOpen(false);
    };

    const handleRemoveDiscount = () => {
        setDiscount(null);
        setDiscountValue(0);
        setDiscountReason('');
        setIsDiscountModalOpen(false);
    }

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price, 0), [cart]);
    
    const calculatedDiscount = useMemo(() => {
        if (!discount) return 0;
        if (discount.type === 'monto') {
            return Math.min(discount.value, subtotal);
        }
        if (discount.type === 'porcentaje') {
            return (subtotal * discount.value) / 100;
        }
        return 0;
    }, [discount, subtotal]);

    const total = subtotal - calculatedDiscount;
    
    useEffect(() => {
        if (cart.length === 0) {
            setDeliveryDate('');
            return;
        }
    
        const maxDeliveryDays = cart.reduce((maxDays, item) => {
            let deliveryDays = 0;
            const study = studies.find(s => s.id === Number(item.id));
    
            if (study) {
                if (study.deliveryUnit === 'dias') {
                    deliveryDays = study.deliveryTime;
                } else if (study.deliveryUnit === 'horas') {
                    deliveryDays = Math.ceil(study.deliveryTime / 24);
                }
            }
    
            return Math.max(maxDays, deliveryDays);
        }, 0);
    
        const newDeliveryDate = new Date();
        newDeliveryDate.setDate(newDeliveryDate.getDate() + maxDeliveryDays);
        setDeliveryDate(newDeliveryDate.toISOString().split('T')[0]);
    
    }, [cart, studies]);


    const resetForm = () => {
        setSearchTerm('');
        setSelectedPatient(null);
        setCart([]);
        setSelectedDoctor('A QUIEN CORRESPONDA');
        setDeliveryDate('');
        setDiscount(null);
    };
    
    const handlePrintTicket = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Ticket de Venta</title>');
            printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } @page { size: 80mm auto; margin: 0; } } body { font-family: monospace; font-size: 10px; margin: 0; padding: 5px; width: 78mm; }</style>');
            printWindow.document.write('</head><body>');
            const ticketElement = document.getElementById('ticket-preview-content');
            if (ticketElement) {
                printWindow.document.write(ticketElement.innerHTML);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
        setShowPrintDialog(false);
        router.push('/solicitud-examenes');
    };

    const handleSaveRequest = async () => {
        if (!selectedPatient || cart.length === 0 || !deliveryDate) {
            toast({
                title: "Faltan datos",
                description: "Por favor, seleccione un paciente, añada estudios y elija una fecha de entrega.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);

        const studiesInCart = cart.filter(i => i.type === 'study').map(i => i.name);
        const packagesInCart = cart.filter(i => i.type === 'package').map(i => i.name);

        try {
            const newRecibo: ReciboCreation = {
                patientCode: String(selectedPatient.id),
                patientName: selectedPatient.name,
                contract: selectedPatient.convenio,
                subtotal,
                discount: calculatedDiscount,
                total,
                paid: 0,
                due: total,
                studies: studiesInCart,
                packages: packagesInCart,
                doctor: selectedDoctor,
                deliveryDate,
            };
            
            setLastRecibo(newRecibo);
            await createRecibo(newRecibo);

            toast({
                title: "Éxito",
                description: "La solicitud de examen ha sido guardada correctamente."
            });
            
            resetForm();
            setShowPrintDialog(true);

        } catch (error) {
            console.error("Error saving request:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la solicitud. Por favor, intente de nuevo.",
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

    const doctorOptions = useMemo(() => [
        { id: 'default', name: 'A QUIEN CORRESPONDA' },
        ...doctors
    ], [doctors]);
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

    return (
        <>
            <div className="flex flex-col gap-6 py-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">Crear Solicitud de Examen</h1>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <Link href="/solicitud-examenes" className="hover:text-primary">Solicitud de Exámenes</Link> / Crear
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card>
                            <CardHeader className="bg-primary text-primary-foreground">
                                <CardTitle className="flex items-center gap-2"><UserSearch /> Buscar Paciente</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-end gap-4">
                                    <div className="flex-grow space-y-2 relative">
                                        <Label htmlFor="patient-search">Buscar por nombre o número de paciente</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="patient-search"
                                                placeholder="Escriba aquí para buscar..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        {searchTerm && filteredPatients.length > 0 && (
                                            <div className="absolute z-10 w-full bg-card border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                                {filteredPatients.map(p => (
                                                    <div key={p.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => handleSelectPatient(p)}>
                                                        {p.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Nuevo Paciente</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-4xl">
                                             <DialogHeader>
                                                <DialogTitle>Crear Nuevo Paciente</DialogTitle>
                                             </DialogHeader>
                                             <CreatePatientForm onSuccess={handlePatientCreated} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>

                        {selectedPatient && (
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
                                                        <TableCell>{item.name}</TableCell>
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
                                <CardTitle>Detalles de la Solicitud</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedPatient ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <User className="text-primary"/>
                                            <span>{selectedPatient.name}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Convenio: {selectedPatient.convenio || 'Ninguno'}</p>
                                            <p>{selectedPatient.age} {selectedPatient.ageUnit}</p>
                                            <p>{selectedPatient.email}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Médico</Label>
                                            <div className="flex gap-2">
                                                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                                    <SelectTrigger><SelectValue placeholder="Seleccione un médico" /></SelectTrigger>
                                                    <SelectContent>
                                                        {doctorOptions.map(doctor => (
                                                            <SelectItem key={doctor.id} value={doctor.name}>{doctor.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Agregar Nuevo Doctor</DialogTitle>
                                                        </DialogHeader>
                                                        <CreateDoctorForm onSuccess={handleDoctorCreated} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fecha de Entrega</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="date" className="pl-10 bg-muted/50" value={deliveryDate} readOnly/>
                                            </div>
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
                                        <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
                                            <DialogTrigger asChild>
                                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 p-0 h-auto justify-start">
                                                    <Tag className="h-5 w-5 mr-2"/> Descuento
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Gestionar Descuento</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    {discount && (
                                                        <div className="p-3 rounded-md bg-muted flex justify-between items-center">
                                                            <div>
                                                                <p className="font-semibold">
                                                                    {discount.type === 'monto' ? `$${discount.value}` : `${discount.value}%`} de descuento
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">{discount.reason}</p>
                                                            </div>
                                                            <Button variant="destructive" size="sm" onClick={handleRemoveDiscount}>Eliminar</Button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Label>Tipo de Descuento</Label>
                                                        <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as any)} className="flex gap-4">
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="monto" id="monto"/><Label htmlFor="monto">Por Monto</Label></div>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="porcentaje" id="porcentaje"/><Label htmlFor="porcentaje">Por Porcentaje</Label></div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Valor</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{discountType === 'monto' ? '$' : '%'}</span>
                                                            <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="pl-8" onFocus={handleFocus}/>
                                                        </div>
                                                    </div>
                                                        <div className="space-y-2">
                                                        <Label>Motivo del Descuento</Label>
                                                        <Textarea value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>Cancelar</Button>
                                                    <Button onClick={handleApplyDiscount}>Aplicar Descuento</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <span>-${Number(calculatedDiscount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-xl text-primary">
                                        <span className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Total</span>
                                        <span>${Number(total).toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full" size="lg" disabled={cart.length === 0 || !deliveryDate || loading} onClick={handleSaveRequest}>
                                        <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Solicitud'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            
             <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Solicitud Guardada</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Desea imprimir el ticket de venta?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => router.push('/solicitud-examenes')}>No</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePrintTicket}>Sí, Imprimir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Hidden component for printing */}
            <div className="hidden">
                 {lastRecibo && (
                    <div id="ticket-preview-content">
                       <SalesTicket recibo={lastRecibo} items={cart} />
                    </div>
                )}
            </div>

        </>
    );
}
