
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, PlusSquare } from "lucide-react";
import { getDoctorById, updateDoctor } from '@/services/doctoresServicio';
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from '@/hooks/useLoader';

const doctorSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Correo electrónico no válido." }).optional().or(z.literal('')),
  address: z.string().optional(),
  commission: z.coerce.number().min(0, "La comisión no puede ser negativa.").max(100, "La comisión no puede ser mayor a 100."),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function EditDoctorPage() {
    const router = useRouter();
    const params = useParams();
    const doctorId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            nombre: '',
            phone: '',
            email: '',
            address: '',
            commission: 0,
        }
    });

    useEffect(() => {
        if (doctorId) {
            loader.start("read");
            getDoctorById(doctorId)
                .then((doctorData) => {
                    if (doctorData) {
                        form.reset({
                            ...doctorData,
                            phone: doctorData.phone || '',
                            email: doctorData.email || '',
                            address: doctorData.address || ''
                        });
                    } else {
                        toast({ title: "Error", description: "Doctor no encontrado.", variant: "destructive" });
                        router.push('/doctores');
                    }
                })
                .catch(error => {
                    console.error("Error fetching doctor:", error);
                    toast({ title: "Error", description: "No se pudieron cargar los datos del doctor.", variant: "destructive" });
                })
                .finally(() => loader.stop());
        }
    }, [doctorId, router, form.reset, toast, loader.start, loader.stop]);

    const onSubmit = async (data: DoctorFormValues) => {
        loader.start("update");
        try {
            await updateDoctor(doctorId, data);
            toast({
                title: "Éxito",
                description: "Doctor actualizado correctamente.",
            });
            router.push('/doctores');
        } catch (error) {
            console.error("Error updating doctor: ", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el doctor.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
        }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PlusSquare className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Doctores</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/doctores" className="hover:text-primary">Doctores</Link> / Editar Doctor
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Doctor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="nombre" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre del doctor" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="Correo electrónico" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Dirección" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="commission" render={({ field }) => (
                            <FormItem><FormLabel>Comisión</FormLabel>
                                <div className="relative">
                                    <FormControl><Input type="number" placeholder="0" {...field} disabled={loader.status !== 'idle'} onFocus={handleFocus} /></FormControl>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                </div>
                            <FormMessage /></FormItem>
                        )}/>
                    </div>
                    
                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2"/> {loader.status === 'update' ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
