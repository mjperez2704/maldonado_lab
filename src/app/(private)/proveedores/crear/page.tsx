
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, User } from "lucide-react";
import { createProvider } from '@/services/providerServicio';
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from '@/hooks/useLoader';

const providerSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Correo electrónico no válido." }).optional().or(z.literal('')),
  address: z.string().optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export default function CreateProviderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
        }
    });

    const onSubmit = async (data: ProviderFormValues) => {
        let success = false;
        loader.start("create");
        try {
            await createProvider({
                ...data,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
            });
            toast({ title: "Éxito", description: "Proveedor creado correctamente." });
            form.reset();
            success = true;
        } catch (error) {
            console.error("Error creating provider: ", error);
            toast({ title: "Error", description: "No se pudo crear el proveedor.", variant: "destructive" });
        } finally {
            loader.stop();
            if(success) {
                setTimeout(() => router.push('/proveedores'), 500);
            }
        }
    };

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Proveedores</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/proveedores" className="hover:text-primary">Proveedores</Link> / Crear Proveedor
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Proveedor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre del proveedor" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="Correo electrónico" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Dirección" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2"/> {loader.status === 'create' ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
