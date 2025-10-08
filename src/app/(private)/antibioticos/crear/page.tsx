
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check, Pill } from "lucide-react";
import { createAntibiotic } from "@/services/antibioticServicio";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const antibioticSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  shortcut: z.string().optional(),
  commercialName: z.string().optional(),
  administrationRoute: z.string().min(1, { message: "La vía de administración es requerida." }),
  presentation: z.string().optional(),
  laboratory: z.string().optional(),
});

type AntibioticFormValues = z.infer<typeof antibioticSchema>;

export default function CreateAntibioticPage() {
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<AntibioticFormValues>({
        resolver: zodResolver(antibioticSchema),
        defaultValues: {
            name: '',
            shortcut: '',
            commercialName: '',
            administrationRoute: '',
            presentation: '',
            laboratory: '',
        }
    });

    const onSubmit = async (data: AntibioticFormValues) => {
        let success = false;
        loader.start("create");
        try {
            const antibioticData = {
                ...data,
                shortcut: data.shortcut || '',
                commercialName: data.commercialName || '',
                presentation: data.presentation || '',
                laboratory: data.laboratory || '',
            };
            await createAntibiotic(antibioticData);
            toast({
                title: "Éxito",
                description: "Antibiótico creado correctamente.",
            });
            form.reset();
            success = true;
        } catch (error) {
            console.error("Error creating antibiotic: ", error);
            toast({
                title: "Error",
                description: "No se pudo crear el antibiótico.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
            if (success) {
                setTimeout(() => router.push('/antibioticos'), 500);
            }
        }
    };

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pill className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Antibióticos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/antibioticos" className="hover:text-primary">Antibióticos</Link> / Crear Antibiótico
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Antibiótico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre del antibiótico" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="shortcut" render={({ field }) => (
                            <FormItem><FormLabel>Atajo</FormLabel><FormControl><Input placeholder="Atajo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="commercialName" render={({ field }) => (
                            <FormItem><FormLabel>Nombre Comercial</FormLabel><FormControl><Input placeholder="Nombre Comercial" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="administrationRoute" render={({ field }) => (
                            <FormItem><FormLabel>Vía de Administración</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar vía" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="oral">Oral</SelectItem>
                                        <SelectItem value="intramuscular">Intramuscular</SelectItem>
                                        <SelectItem value="intravenosa">Intravenosa</SelectItem>
                                        <SelectItem value="topica">Tópica</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="presentation" render={({ field }) => (
                            <FormItem><FormLabel>Presentación</FormLabel><FormControl><Input placeholder="Ej: 80mg, 500ml" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="laboratory" render={({ field }) => (
                            <FormItem><FormLabel>Laboratorio</FormLabel><FormControl><Input placeholder="Nombre del laboratorio" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    
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
