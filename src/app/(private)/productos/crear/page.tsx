
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Boxes, Check, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/services/productService";
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
  category: z.string().min(1, "La categoría es requerida."),
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

export default function CreateProductPage() {
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sku: '',
            branch: '',
            category: '',
            unit: '',
            purchasePrice: 0,
            salePrice: 0,
            initialStock: 0,
            stockAlert: 0,
            expiryDate: '',
            expiryAlertDays: 0,
            expiryAlertActive: false,
        }
    });

    const onSubmit = async (data: ProductFormValues) => {
        let success = false;
        loader.start('create');
        try {
            // Aseguramos que los campos opcionales tengan un valor por defecto
            const productData = {
                ...data,
                sku: data.sku || '',
                expiryDate: data.expiryDate || undefined,
            };

            await createProduct(productData);
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
                            <FormItem><FormLabel>Sucursal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Sucursal Principal</SelectItem><SelectItem value="secondary">Sucursal Secundaria</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoría</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger></FormControl><SelectContent><SelectItem value="reagents">Reactivos</SelectItem><SelectItem value="materials">Materiales</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="unit" render={({ field }) => (
                           <FormItem><FormLabel>Unidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger></FormControl><SelectContent><SelectItem value="piece">Pieza</SelectItem><SelectItem value="kit">Kit</SelectItem><SelectItem value="box">Caja</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                            <FormItem><FormLabel>Precio de compra</FormLabel><div className="flex items-center"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span><FormControl><Input type="number" placeholder="Precio de compra" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'} /></FormControl></div><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="salePrice" render={({ field }) => (
                            <FormItem><FormLabel>Precio de venta</FormLabel><div className="flex items-center"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span><FormControl><Input type="number" placeholder="Precio de venta" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'} /></FormControl></div><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="initialStock" render={({ field }) => (
                            <FormItem><FormLabel>Cantidad inicial</FormLabel><FormControl><Input type="number" placeholder="Cantidad inicial" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="stockAlert" render={({ field }) => (
                            <FormItem><FormLabel>Alerta de cantidad</FormLabel><FormControl><Input type="number" placeholder="Alerta de cantidad" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem><FormLabel>Caducidad</FormLabel><div className="relative"><FormControl><Input type="date" placeholder="DD/MM/AAAA" {...field} disabled={loader.status !== 'idle'} /></FormControl><CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div><FormMessage /></FormItem>
                        )}/>
                        <div className="flex items-end space-x-2">
                           <FormField control={form.control} name="expiryAlertDays" render={({ field }) => (
                                <FormItem className="flex-grow"><FormLabel>Días aviso caducidad</FormLabel><FormControl><Input type="number" placeholder="Días" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                           )}/>
                            <FormField control={form.control} name="expiryAlertActive" render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 pb-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={loader.status !== 'idle'} /></FormControl><FormLabel>Activo</FormLabel></FormItem>
                           )}/>
                        </div>
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
