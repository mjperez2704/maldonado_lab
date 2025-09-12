
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Package as PackageIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createPackage, Package } from "@/services/packageService";
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

export default function CreatePackagePage() {
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: '',
            shortcut: '',
            price: 0,
            tests: '',
            cultures: '',
            precautions: '',
        }
    });

    const onSubmit = async (data: PackageFormValues) => {
        let success = false;
        loader.start('create');
        try {
            const packageData: Omit<Package, 'id'> = {
                name: data.name,
                shortcut: data.shortcut || '',
                price: data.price,
                precautions: data.precautions || '',
                tests: data.tests?.split(',').map(t => t.trim()).filter(t => t) || [],
                cultures: data.cultures?.split(',').map(c => c.trim()).filter(c => c) || [],
            };
            await createPackage(packageData);
            toast({
                title: "Éxito",
                description: "Paquete creado correctamente.",
            });
            form.reset();
            success = true;
        } catch (error) {
            console.error("Error creating package:", error);
            toast({
                title: "Error",
                description: "No se pudo crear el paquete.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
            if (success) {
                setTimeout(() => router.push('/paquetes'), 500);
            }
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
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/paquetes" className="hover:text-primary">Paquetes</Link> / Crear paquete
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear paquete</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del paquete</FormLabel><FormControl><Input placeholder="Nombre del paquete" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="shortcut" render={({ field }) => (
                            <FormItem><FormLabel>Atajo</FormLabel><FormControl><Input placeholder="Atajo" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Precio</FormLabel>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span>
                                    <FormControl><Input type="number" placeholder="Precio" className="rounded-l-none" {...field} onFocus={handleFocus} /></FormControl>
                                </div>
                            <FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="tests" render={({ field }) => (
                            <FormItem className="md:col-span-3"><FormLabel>Pruebas (separadas por coma)</FormLabel><FormControl><Input placeholder="Pruebas" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="cultures" render={({ field }) => (
                            <FormItem className="md:col-span-3"><FormLabel>Cultivos (separados por coma)</FormLabel><FormControl><Input placeholder="Cultivos" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <FormField control={form.control} name="precautions" render={({ field }) => (
                        <FormItem><FormLabel>Precauciones</FormLabel><FormControl><Textarea placeholder="Precauciones" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2"/> {loader.status === 'create' ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
