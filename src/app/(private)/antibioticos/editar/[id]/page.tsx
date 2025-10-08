
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check, Pill } from "lucide-react";
import { getAntibioticById, updateAntibiotic } from "@/services/antibioticosServicio";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const antibioticSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  shortcut: z.string().optional(),
  commercialName: z.string().optional(),
  administrationRoute: z.string().min(1, { message: "La vía de administración es requerida." }),
  presentation: z.string().optional(),
  laboratory: z.string().optional(),
});

type AntibioticFormValues = z.infer<typeof antibioticSchema>;

export default function EditAntibioticPage() {
    const router = useRouter();
    const params = useParams();
    const antibioticId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<AntibioticFormValues>({
        resolver: zodResolver(antibioticSchema),
        defaultValues: {
            nombre: '',
            shortcut: '',
            commercialName: '',
            administrationRoute: '',
            presentation: '',
            laboratory: '',
        }
    });

    useEffect(() => {
        if (antibioticId) {
            loader.start("read");
            getAntibioticById(antibioticId)
                .then((antibioticData) => {
                    if (antibioticData) {
                        form.reset({
                            ...antibioticData,
                            shortcut: antibioticData.shortcut || '',
                            commercialName: antibioticData.commercialName || '',
                            presentation: antibioticData.presentation || '',
                            laboratory: antibioticData.laboratory || '',
                        });
                    } else {
                        toast({ title: "Error", description: "Antibiótico no encontrado.", variant: "destructive" });
                        router.push('/antibioticos');
                    }
                })
                .catch(error => {
                    console.error("Error fetching antibiotic:", error);
                    toast({ title: "Error", description: "No se pudieron cargar los datos del antibiótico.", variant: "destructive" });
                })
                .finally(() => loader.stop());
        }
    }, [antibioticId, router, form.reset, toast, loader.start, loader.stop]);


    const onSubmit = async (data: AntibioticFormValues) => {
        loader.start("update");
        try {
            await updateAntibiotic(antibioticId, data);
            toast({
                title: "Éxito",
                description: "Antibiótico actualizado correctamente.",
            });
            router.push('/antibioticos');
        } catch (error) {
            console.error("Error updating antibiotic: ", error);
             toast({
                title: "Error",
                description: "No se pudo actualizar el antibiótico.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
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
           <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/antibioticos" className="hover:text-primary">Antibióticos</Link> / Editar Antibiótico
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Antibiótico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <FormField control={form.control} name="nombre" render={({ field }) => (
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}>
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
