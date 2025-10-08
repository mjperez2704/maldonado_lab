
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Boxes, Check, Calendar as CalendarIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { getProductById, updateProduct } from "@/services/productServicio";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  sku: z.string().optional(),
  branch: z.string().min(1, "La sucursal es requerida."),
  categoria: z.string().min(1, "La categoría es requerida."),
  unit: z.string().min(1, "La unidad es requerida."),
  purchasePrice: z.coerce.number().min(0, "El precio debe ser positivo."),
  salePrice: z.coerce.number().min(0, "El precio debe ser positivo."),
  initialStock: z.coerce.number().min(0, "El stock debe ser positivo."),
  stockAlert: z.coerce.number().min(0, "La alerta de stock debe ser positiva."),
  expiryDate: z.string().optional(),
  expiryAlertDays: z.coerce.number().min(0, "Los días deben ser positivos."),
  expiryAlertActive: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        if (productId) {
            loader.start('read');
            getProductById(productId).then(productData => {
                if (productData) {
                    form.reset({
                        ...productData,
                        expiryDate: productData.expiryDate ? productData.expiryDate.split('T')[0] : '',
                        sku: productData.sku || '',
                    });
                } else {
                    toast({ title: "Error", description: "Producto no encontrado.", variant: "destructive" });
                    router.push('/productos');
                }
            }).catch(error => {
                console.error("Error fetching product:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos del producto.", variant: "destructive" });
            }).finally(() => loader.stop());
        }
    }, [productId, router, form.reset, toast, loader.start, loader.stop]);

    const onSubmit = async (data: ProductFormValues) => {
        loader.start('update');
        try {
            await updateProduct(productId, data);
            toast({
                title: "Éxito",
                description: "Producto actualizado correctamente.",
            });
            router.push('/productos');
        } catch (error) {
            console.error("Error updating product: ", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el producto.",
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
          <Boxes className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Productos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/productos" className="hover:text-primary">Productos</Link> / Editar producto
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar producto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre del producto" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem><FormLabel>SKU</FormLabel><FormControl><Input placeholder="SKU" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="branch" render={({ field }) => (
                            <FormItem><FormLabel>Sucursal</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Sucursal Principal</SelectItem><SelectItem value="secondary">Sucursal Secundaria</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="categoria" render={({ field }) => (
                            <FormItem><FormLabel>Categoría</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger></FormControl><SelectContent><SelectItem value="reagents">Reactivos</SelectItem><SelectItem value="materials">Materiales</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="unit" render={({ field }) => (
                           <FormItem><FormLabel>Unidad</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger></FormControl><SelectContent><SelectItem value="piece">Pieza</SelectItem><SelectItem value="kit">Kit</SelectItem><SelectItem value="box">Caja</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                            <FormItem><FormLabel>Precio de compra</FormLabel><div className="flex items-center"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span><FormControl><Input type="number" placeholder="Precio de compra" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'}/></FormControl></div><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="salePrice" render={({ field }) => (
                            <FormItem><FormLabel>Precio de venta</FormLabel><div className="flex items-center"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span><FormControl><Input type="number" placeholder="Precio de venta" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'}/></FormControl></div><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="initialStock" render={({ field }) => (
                            <FormItem><FormLabel>Cantidad inicial</FormLabel><FormControl><Input type="number" placeholder="Cantidad inicial" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="stockAlert" render={({ field }) => (
                            <FormItem><FormLabel>Alerta de cantidad</FormLabel><FormControl><Input type="number" placeholder="Alerta de cantidad" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem><FormLabel>Caducidad</FormLabel><div className="relative"><FormControl><Input type="date" placeholder="DD/MM/AAAA" {...field} disabled={loader.status !== 'idle'}/></FormControl><CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div><FormMessage /></FormItem>
                        )}/>
                        <div className="flex items-end space-x-2">
                           <FormField control={form.control} name="expiryAlertDays" render={({ field }) => (
                                <FormItem className="flex-grow"><FormLabel>Días aviso caducidad</FormLabel><FormControl><Input type="number" placeholder="Días" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                           )}/>
                            <FormField control={form.control} name="expiryAlertActive" render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 pb-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={loader.status !== 'idle'}/></FormControl><FormLabel>Activo</FormLabel></FormItem>
                           )}/>
                        </div>
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
