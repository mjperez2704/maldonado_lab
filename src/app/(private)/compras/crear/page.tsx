
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, ShoppingCart, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createPurchase, Purchase } from "@/services/purchaseService";
import { getProviders, Provider } from "@/services/providerService";
import Link from "next/link";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const purchaseProductSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido."),
  unitPrice: z.coerce.number().min(0.01, "El precio unitario debe ser mayor a 0."),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
});

const purchasePaymentSchema = z.object({
    date: z.string().min(1, "La fecha es requerida."),
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0."),
    method: z.string().min(1, "El método de pago es requerido."),
});

const purchaseSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  branch: z.string().min(1, "La sucursal es requerida."),
  provider: z.string().min(1, "El proveedor es requerido."),
  notes: z.string().optional(),
  products: z.array(purchaseProductSchema).min(1, "Debe agregar al menos un producto."),
  payments: z.array(purchasePaymentSchema).min(1, "Debe agregar al menos un pago."),
  tax: z.coerce.number().min(0).optional().default(0),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function CreatePurchasePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    
    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            branch: '',
            provider: '',
            notes: '',
            products: [{ name: '', unitPrice: 0, quantity: 1 }],
            payments: [{ date: new Date().toISOString().split('T')[0], amount: 0, method: '' }],
            tax: 0,
        },
    });

    const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({ control: form.control, name: "products" });
    const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({ control: form.control, name: "payments" });

    const watchedProducts = useWatch({ control: form.control, name: 'products' });
    const watchedPayments = useWatch({ control: form.control, name: 'payments' });
    const watchedTax = useWatch({ control: form.control, name: 'tax' });

    const subtotal = React.useMemo(() => 
        (watchedProducts || []).reduce((acc, p) => acc + (p.unitPrice || 0) * (p.quantity || 0), 0), 
    [watchedProducts]);

    const totalPaid = React.useMemo(() => 
        (watchedPayments || []).reduce((acc, p) => acc + (p.amount || 0), 0),
    [watchedPayments]);
    
    const total = subtotal + (watchedTax || 0);
    const due = total - totalPaid;

    useEffect(() => {
        getProviders().then(setProviders);
    }, []);

    const onSubmit = async (data: PurchaseFormValues) => {
        try {
            const purchaseData: Omit<Purchase, 'id'> = {
                ...data,
                notes: data.notes || '',
                products: data.products.map(p => ({...p, totalPrice: p.unitPrice * p.quantity })),
                subtotal,
                total,
                paid: totalPaid,
                due,
            };
            await createPurchase(purchaseData);
            toast({ title: "Éxito", description: "Compra creada correctamente." });
            router.push('/compras');
        } catch (error) {
            console.error("Error creating purchase: ", error);
            toast({ title: "Error", description: "No se pudo crear la compra.", variant: "destructive" });
        }
    };
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Compras</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/compras" className="hover:text-primary">Compras</Link> / Crear compra
        </div>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Crear compra</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Fecha</FormLabel><div className="relative"><FormControl><Input type="date" {...field} /></FormControl><CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem><FormLabel>Sucursal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Sucursal Principal</SelectItem><SelectItem value="secondary">Sucursal Secundaria</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="provider" render={({ field }) => (
                    <FormItem><FormLabel>Proveedor</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger></FormControl><SelectContent>{providers.map(p => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem className="md:col-span-3"><FormLabel>Nota</FormLabel><FormControl><Textarea placeholder="Nota" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="font-semibold text-lg">Productos</h3>
                    <Button onClick={() => appendProduct({ name: '', unitPrice: 0, quantity: 1 })} size="icon" type="button" className="bg-primary hover:bg-primary/90">
                        <Plus />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Precio unitario</TableHead><TableHead>Cantidad</TableHead><TableHead>Precio total</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                           {productFields.map((field, index) => {
                                const product = watchedProducts[index];
                                const totalPrice = (product?.unitPrice || 0) * (product?.quantity || 0);
                                return (
                                <TableRow key={field.id}>
                                   <TableCell><FormField control={form.control} name={`products.${index}.name`} render={({ field }) => (<FormItem><FormControl><Input placeholder="Producto" {...field} /></FormControl><FormMessage/></FormItem>)}/></TableCell>
                                   <TableCell><FormField control={form.control} name={`products.${index}.unitPrice`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="0.00" {...field} onFocus={handleFocus} /></FormControl><FormMessage/></FormItem>)}/></TableCell>
                                   <TableCell><FormField control={form.control} name={`products.${index}.quantity`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="0" {...field} onFocus={handleFocus} /></FormControl><FormMessage/></FormItem>)}/></TableCell>
                                   <TableCell><Input type="number" placeholder="0.00" value={Number(totalPrice.toFixed(2))} readOnly /></TableCell>
                                   <TableCell>{productFields.length > 1 && (<Button type="button" variant="destructive" size="icon" onClick={() => removeProduct(index)}><Trash2 /></Button>)}</TableCell>
                               </TableRow>
                           )})}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="font-semibold text-lg">Pagos</h3>
                    <Button onClick={() => appendPayment({ date: new Date().toISOString().split('T')[0], amount: 0, method: '' })} size="icon" type="button" className="bg-primary hover:bg-primary/90"><Plus /></Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Cantidad</TableHead><TableHead>Método de pago</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                           {paymentFields.map((field, index) => (
                               <TableRow key={field.id}>
                                   <TableCell><FormField control={form.control} name={`payments.${index}.date`} render={({ field }) => (<FormItem><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/></TableCell>
                                   <TableCell><FormField control={form.control} name={`payments.${index}.amount`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="0.00" {...field} onFocus={handleFocus} /></FormControl><FormMessage /></FormItem>)}/></TableCell>
                                   <TableCell><FormField control={form.control} name={`payments.${index}.method`} render={({ field }) => (<FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar método" /></SelectTrigger></FormControl><SelectContent><SelectItem value="cash">Efectivo</SelectItem><SelectItem value="card">Tarjeta</SelectItem><SelectItem value="transfer">Transferencia</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/></TableCell>
                                   <TableCell>{paymentFields.length > 1 && (<Button type="button" variant="destructive" size="icon" onClick={() => removePayment(index)}><Trash2 /></Button>)}</TableCell>
                               </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Card className="bg-muted/50">
                <CardHeader><CardTitle className="text-lg">Resumen de la Compra</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg"><Label>Total parcial</Label><Input className="text-right border-0 bg-transparent w-24" value={Number(subtotal.toFixed(2))} readOnly/></div>
                     <FormField control={form.control} name="tax" render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 bg-background rounded-lg"><FormLabel>Impuestos</FormLabel><FormControl><Input type="number" className="text-right border-0 bg-transparent w-24" {...field} onFocus={handleFocus} /></FormControl></FormItem>
                     )}/>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg"><Label>Total</Label><Input className="text-right border-0 bg-transparent w-24" value={Number(total.toFixed(2))} readOnly/></div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg"><Label>Pagado</Label><Input className="text-right border-0 bg-transparent w-24" value={Number(totalPaid.toFixed(2))} readOnly/></div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg"><Label>Debido</Label><Input className="text-right border-0 bg-transparent w-24" value={Number(due.toFixed(2))} readOnly/></div>
                </CardContent>
            </Card>

            <div className="flex justify-start">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Check className="mr-2"/> {form.formState.isSubmitting ? "Guardando..." : "Guardar Compra"}
                </Button>
            </div>
        </CardContent>
      </Card>
      </form>
      </Form>
    </div>
  );
}
