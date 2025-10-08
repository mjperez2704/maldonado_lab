
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building, Check } from "lucide-react";
import { getBranchById, updateBranch } from "@/services/branchServicio";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const branchSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;


export default function EditBranchPage() {
    const router = useRouter();
    const params = useParams();
    const branchId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
        }
    });


  useEffect(() => {
    if (branchId) {
      loader.start('read');
      getBranchById(branchId)
        .then((branchData) => {
          if (branchData) {
            form.reset({
                ...branchData,
                phone: branchData.phone || '',
                address: branchData.address || '',
            });
          } else {
            toast({
              title: "Error",
              description: "Sucursal no encontrada.",
              variant: "destructive",
            });
            router.push("/sucursales");
          }
        })
        .catch((error) => {
          console.error("Error fetching branch:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos de la sucursal.",
            variant: "destructive",
          });
        })
        .finally(() => loader.stop());
    }
  }, [branchId, router, toast, form, loader]);

  const onSubmit = async (data: BranchFormValues) => {
    loader.start("update");
    try {
      await updateBranch(branchId, data);
      toast({
        title: "Éxito",
        description: "La sucursal se ha actualizado correctamente.",
      });
      router.push("/sucursales");
    } catch (error) {
      console.error("Error updating branch: ", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la sucursal.",
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
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Sucursales</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/sucursales" className="hover:text-primary">Sucursales</Link> / Editar Sucursal
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Sucursal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre de la sucursal" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Teléfono" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="md:col-span-2 lg:col-span-3"><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Dirección completa" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
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
