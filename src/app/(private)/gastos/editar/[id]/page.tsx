"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BadgePercent, Check } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

// Importar los nuevos servicios y sus interfaces
import { getExpenseById, updateExpense } from "@/services/expenseService";
import { getBranches, Branch } from "@/services/branchService";
import { getExpenseCategories, ExpenseCategory } from "@/services/expenseCategoryService";

// Esquema de Zod actualizado
const expenseSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  branch_id: z.coerce.number().min(1, "La sucursal es requerida."),
  category_id: z.coerce.number().min(1, "La categoría es requerida."),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0."),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function EditExpensePage() {
    const router = useRouter();
    const params = useParams();
    const expenseId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
    });

    useEffect(() => {
        if (expenseId) {
            loader.start('read');
            Promise.all([
                getExpenseById(expenseId),
                getBranches(),
                getExpenseCategories()
            ]).then(([expenseData, branchesData, categoriesData]) => {
                if (expenseData) {
                    form.reset({
                        ...expenseData,
                        date: new Date(expenseData.date).toISOString().split('T')[0],
                        notes: expenseData.notes || '',
                    });
                } else {
                    toast({ title: "Error", description: "Gasto no encontrado.", variant: "destructive" });
                    router.push('/gastos');
                }
                setBranches(branchesData);
                setExpenseCategories(categoriesData);
            }).catch(error => {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos para la edición.", variant: "destructive" });
            }).finally(() => loader.stop());
        }
    }, [expenseId, router, form, toast, loader]);

    const onSubmit = async (data: ExpenseFormValues) => {
        loader.start('update');
        try {
            await updateExpense(expenseId, {
                ...data,
                notes: data.notes || null,
            });
            toast({ title: "Éxito", description: "Gasto actualizado correctamente." });
            router.push('/gastos');
        } catch (error) {
            console.error("Error updating expense:", error);
            toast({ title: "Error", description: "No se pudo actualizar el gasto.", variant: "destructive" });
        } finally {
            loader.stop();
        }
    };

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BadgePercent className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Gastos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/gastos" className="hover:text-primary">Gastos</Link> / Editar Gasto
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Gasto</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem><FormLabel>Fecha*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem><FormLabel>Monto*</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="branch_id" render={({ field }) => (
                            <FormItem><FormLabel>Sucursal*</FormLabel>
                                <Select onValueChange={field.onChange} value={String(field.value)}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl>
                                    <SelectContent>{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="category_id" render={({ field }) => (
                            <FormItem><FormLabel>Categoría*</FormLabel>
                                <Select onValueChange={field.onChange} value={String(field.value)}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger></FormControl>
                                    <SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Notas</FormLabel><FormControl><Textarea placeholder="Notas adicionales sobre el gasto..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2 h-4 w-4"/> {loader.status === 'update' ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
