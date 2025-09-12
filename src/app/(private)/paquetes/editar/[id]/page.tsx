
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Package as PackageIcon } from "lucide-react";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPackageById, updatePackage, Package } from "@/services/packageService";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const packageSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  shortcut: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  tests: z.string().optional(),
  cultures: z.string().optional(),
  precautions: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const packageId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema),
    });

    useEffect(() => {
        if (packageId) {
            loader.start('read');
            getPackageById(packageId)
                .then(pkg => {
                    if (pkg) {
                        form.reset({
                            name: pkg.name,
                            shortcut: pkg.shortcut || '',
                            price: pkg.price,
                            tests: pkg.tests.join(', '),
                            cultures: pkg.cultures.join(', '),
                            precautions: pkg.precautions || '',
                        });
                    } else {
                         toast({ title: "Error", description: "Paquete no encontrado.", variant: "destructive" });
                         router.push('/paquetes');
                    }
                })
                .catch(error => {
                    console.error("Error fetching package:", error);
                    toast({ title: "Error", description: "No se pudieron cargar los datos del paquete.", variant: "destructive" });
                })
                .finally(() => loader.stop());
        }
    }, [packageId, router, form.reset, toast, loader.start, loader.stop]);

    const onSubmit = async (data: PackageFormValues) => {
        loader.start('update');
        try {
            const packageData: Omit<Package, 'id'> = {
                name: data.name,
                shortcut: data.shortcut || '',
                price: data.price,
                precautions: data.precautions || '',
                tests: data.tests?.split(',').map(t => t.trim()).filter(t => t) || [],
                cultures: data.cultures?.split(',').map(c => c.trim()).filter(c => c) || [],
            };
            await updatePackage(packageId, packageData);
            toast({
                title: "Éxito",
                description: "Paquete actualizado correctamente.",
            });
            router.push('/paquetes');
        } catch (error) {
            console.error("Error updating package:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el paquete.",
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
            <PackageIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Paquetes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/paquetes" className="hover:text-primary">Paquetes</Link> / Editar paquete
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar paquete</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del paquete</FormLabel><FormControl><Input placeholder="Nombre del paquete" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="shortcut" render={({ field }) => (
                            <FormItem><FormLabel>Atajo</FormLabel><FormControl><Input placeholder="Atajo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Precio</FormLabel>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span>
                                    <FormControl><Input type="number" placeholder="Precio" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'} onFocus={handleFocus} /></FormControl>
                                </div>
                            <FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="tests" render={({ field }) => (
                            <FormItem className="md:col-span-3"><FormLabel>Pruebas (separadas por coma)</FormLabel><FormControl><Input placeholder="Pruebas" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="cultures" render={({ field }) => (
                            <FormItem className="md:col-span-3"><FormLabel>Cultivos (separados por coma)</FormLabel><FormControl><Input placeholder="Cultivos" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <FormField control={form.control} name="precautions" render={({ field }) => (
                        <FormItem><FormLabel>Precauciones</FormLabel><FormControl><Textarea placeholder="Precauciones" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2"/> {loader.status === 'update' ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
