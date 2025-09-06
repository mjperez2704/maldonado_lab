"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Landmark, ClipboardPlus, History, TrendingUp, TrendingDown, Trash2, Calendar, User, DollarSign } from "lucide-react";
import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Importar los nuevos servicios y sus interfaces
import { createOperation, getOperations, deleteOperation, OperationView } from '@/services/operationService';
import { getEmployees, Employee } from "@/services/employeeService";
import { getBranches, Branch } from "@/services/branchService";

// Esquema de Zod actualizado
const operationSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  concept: z.string().min(1, "El concepto es requerido."),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0."),
  type: z.enum(['ingress', 'egress']),
  payment_method: z.string().min(1, "La forma de pago es requerida."),
  employee_id: z.coerce.number().min(1, "El empleado es requerido."),
  branch_id: z.coerce.number().min(1, "La sucursal es requerida."),
});

type OperationFormValues = z.infer<typeof operationSchema>;

export default function IncomeAndExpensesPage() {
    const { toast } = useToast();
    const [operations, setOperations] = useState<OperationView[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<OperationFormValues>({
        resolver: zodResolver(operationSchema),
        defaultValues: {
            date: new Date().toISOString().slice(0, 16),
            concept: '',
            amount: 0,
            type: 'ingress',
            payment_method: 'efectivo',
        },
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [ops, emps, brs] = await Promise.all([
                getOperations(),
                getEmployees(),
                getBranches()
            ]);
            setOperations(ops);
            setEmployees(emps);
            setBranches(brs);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ title: "Error", description: "No se pudieron cargar los datos iniciales.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const summary = useMemo(() => {
        const ingress = operations.filter(op => op.type === 'ingress').reduce((acc, op) => acc + op.amount, 0);
        const egress = operations.filter(op => op.type === 'egress').reduce((acc, op) => acc + op.amount, 0);
        return { ingress, egress, balance: ingress - egress };
    }, [operations]);

    const onSubmit = async (data: OperationFormValues) => {
        try {
            await createOperation(data);
            toast({ title: "Éxito", description: "Operación registrada correctamente." });
            form.reset({
                ...form.getValues(),
                concept: '',
                amount: 0,
            });
            fetchInitialData(); // Refrescar la lista
        } catch (error) {
             console.error("Error creating operation:", error);
             toast({ title: "Error", description: "No se pudo registrar la operación.", variant: "destructive"});
        }
    };

    const handleDeleteOperation = async (id: number) => {
        if (confirm('¿Está seguro de que desea eliminar esta operación?')) {
            try {
                await deleteOperation(id);
                toast({ title: "Éxito", description: "Operación eliminada." });
                fetchInitialData(); // Refrescar la lista
            } catch (error) {
                console.error("Error deleting operation:", error);
                toast({ title: "Error", description: "No se pudo eliminar la operación.", variant: "destructive"});
            }
        }
    };


  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Landmark className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Ingresos y Egresos Manuales</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Ingresos y Egresos
        </div>
      </div>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2"><ClipboardPlus /> Registrar Nueva Operación</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Fecha</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="branch_id" render={({ field }) => (<FormItem><FormLabel>Sucursal</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl><SelectContent>{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="employee_id" render={({ field }) => (<FormItem><FormLabel>Empleado</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl><SelectContent>{employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="concept" render={({ field }) => (<FormItem className="lg:col-span-4"><FormLabel>Concepto</FormLabel><FormControl><Input placeholder="Ej: Pago de renta, Venta de material..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="payment_method" render={({ field }) => (<FormItem><FormLabel>Forma de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="efectivo">Efectivo</SelectItem><SelectItem value="tarjeta">Tarjeta</SelectItem><SelectItem value="transferencia">Transferencia</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Operación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="ingress">Ingreso</SelectItem><SelectItem value="egress">Egreso</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <Button type="submit" className="self-end bg-green-600 hover:bg-green-700">Agregar Operación</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2"><History /> Historial de Operaciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Concepto</TableHead><TableHead>Tipo</TableHead><TableHead>Monto</TableHead><TableHead>Empleado</TableHead><TableHead>Sucursal</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={7} className="text-center">Cargando...</TableCell></TableRow> : operations.length > 0 ? (
                  operations.map((op) => (
                    <TableRow key={op.id}>
                        <TableCell>{new Date(op.date).toLocaleString()}</TableCell>
                        <TableCell>{op.concept}</TableCell>
                        <TableCell className="flex items-center gap-1">
                            {op.type === 'ingress' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                            <span className="capitalize">{op.type === 'ingress' ? 'Ingreso' : 'Egreso'}</span>
                        </TableCell>
                        <TableCell>${op.amount.toFixed(2)}</TableCell>
                        <TableCell>{op.employee_name}</TableCell>
                        <TableCell>{op.branch_name}</TableCell>
                        <TableCell><Button variant="destructive" size="icon" onClick={() => handleDeleteOperation(op.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-4">No hay operaciones registradas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted"><CardTitle>Resumen del Día</CardTitle></CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-md shadow"><p className="text-sm text-muted-foreground">TOTAL DE INGRESOS</p><p className="text-2xl font-bold text-green-600">${summary.ingress.toFixed(2)}</p></div>
            <div className="bg-white p-4 rounded-md shadow"><p className="text-sm text-muted-foreground">TOTAL DE EGRESOS</p><p className="text-2xl font-bold text-red-600">${summary.egress.toFixed(2)}</p></div>
            <div className="bg-white p-4 rounded-md shadow"><p className="text-sm text-muted-foreground">SALDO FINAL</p><p className="text-2xl font-bold text-primary">${summary.balance.toFixed(2)}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
