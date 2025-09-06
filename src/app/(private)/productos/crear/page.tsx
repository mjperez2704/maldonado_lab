"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Boxes, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/services/productService";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

// Esquema de Zod actualizado para coincidir con la nueva BD
const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  sku: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['ANTIBIOTICO', 'CONSUMIBLE', 'PRUEBA_RAPIDA', 'OTRO']),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser positivo."),
  cost: z.coerce.number().min(0, "El costo debe ser positivo.").optional(),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo."),
  stock_alert: z.coerce.number().min(0, "La alerta de stock no puede ser negativa."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sku: '',
            description: '',
            type: 'CONSUMIBLE',
            unit: '',
            price: 0,
            cost: 0,
            stock: 0,
            stock_alert: 0,
        }
    });

    const onSubmit = async (data: ProductFormValues) => {
        let success = false;
        loader.start('create');
        try {
            await createProduct({
                ...data,
                sku: data.sku || null,
                description: data.description || null,
                unit: data.unit || null,
                cost: data.cost || null,
            });
            toast({
                title: "Éxito",
                description: "Producto creado correctamente.",
            });
            form.reset();
            success = true;
        } catch (error) {
            console.error("Error creating product: ", error);
            toast({
                title: "Error",
                description: "No se pudo crear el producto.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
            if (success) {
                setTimeout(() => router.push('/productos'), 500);
            }
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
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/productos" className="hover:text-primary">Productos</Link> / Crear producto
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear producto</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre*</FormLabel><FormControl><Input placeholder="Nombre del producto" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem><FormLabel>SKU</FormLabel><FormControl><Input placeholder="Código de producto" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Tipo*</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="CONSUMIBLE">Consumible</SelectItem>
                                        <SelectItem value="PRUEBA_RAPIDA">Prueba Rápida</SelectItem>
                                        <SelectItem value="ANTIBIOTICO">Antibiótico</SelectItem>
                                        <SelectItem value="OTRO">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="unit" render={({ field }) => (
                           <FormItem><FormLabel>Unidad</FormLabel><FormControl><Input placeholder="Ej. Pieza, Caja, Kit" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Precio de Venta*</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="cost" render={({ field }) => (
                            <FormItem><FormLabel>Costo de Compra</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="stock" render={({ field }) => (
                            <FormItem><FormLabel>Stock Inicial*</FormLabel><FormControl><Input type="number" placeholder="0" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="stock_alert" render={({ field }) => (
                            <FormItem><FormLabel>Alerta de Stock*</FormLabel><FormControl><Input type="number" placeholder="0" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem className="md:col-span-2 lg:col-span-3"><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción del producto..." {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2 h-4 w-4"/> {loader.status === 'create' ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
