"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Building, Calendar, DollarSign, Scissors, TrendingUp, TrendingDown } from "lucide-react";
import React, { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Importar todos los servicios necesarios
import { getRecibos, ReciboView } from "@/services/reciboService";
import { getExpenses, ExpenseView } from "@/services/expenseService";
import { getOperations, OperationView } from "@/services/operationService";
import { getBranches, Branch } from "@/services/branchService";
import { createCashCut } from "@/services/cashCutService";

export default function CashCutPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    // Datos originales sin filtrar
    const [allRecibos, setAllRecibos] = useState<ReciboView[]>([]);
    const [allExpenses, setAllExpenses] = useState<ExpenseView[]>([]);
    const [allOperations, setAllOperations] = useState<OperationView[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    // Filtros
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Estado para el formulario de cierre
    const [initialCash, setInitialCash] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [recibosData, expensesData, operationsData, branchesData] = await Promise.all([
                    getRecibos(),
                    getExpenses(),
                    getOperations(),
                    getBranches(),
                ]);
                setAllRecibos(recibosData);
                setAllExpenses(expensesData);
                setAllOperations(operationsData);
                setBranches(branchesData);
                if (branchesData.length > 0) {
                    setSelectedBranchId(String(branchesData[0].id)); // Seleccionar la primera por defecto
                }
            } catch (error) {
                console.error("Error fetching data for cash cut:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    // Lógica de filtrado
    const { filteredRecibos, filteredExpenses, filteredOperations } = useMemo(() => {
        if (!selectedBranchId || !selectedDate) {
            return { filteredRecibos: [], filteredExpenses: [], filteredOperations: [] };
        }
        const branchId = Number(selectedBranchId);
        const date = new Date(selectedDate).toDateString();

        const fRecibos = allRecibos.filter(r => r.branch_id === branchId && new Date(r.date).toDateString() === date);
        const fExpenses = allExpenses.filter(e => e.branch_id === branchId && new Date(e.date).toDateString() === date);
        const fOperations = allOperations.filter(o => o.branch_id === branchId && new Date(o.date).toDateString() === date);

        return { filteredRecibos: fRecibos, filteredExpenses: fExpenses, filteredOperations: fOperations };
    }, [allRecibos, allExpenses, allOperations, selectedBranchId, selectedDate]);

    // Lógica de resumen financiero
    const summary = useMemo(() => {
        const incomeFromRecibos = filteredRecibos.reduce((acc, recibo) => acc + recibo.paid, 0);
        const incomeFromOps = filteredOperations.filter(op => op.type === 'ingress').reduce((acc, op) => acc + op.amount, 0);
        const egressFromExpenses = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
        const egressFromOps = filteredOperations.filter(op => op.type === 'egress').reduce((acc, op) => acc + op.amount, 0);

        const totalIngress = incomeFromRecibos + incomeFromOps;
        const totalEgress = egressFromExpenses + egressFromOps;
        const calculatedBalance = initialCash + totalIngress - totalEgress;

        return { totalIngress, totalEgress, calculatedBalance };
    }, [filteredRecibos, filteredExpenses, filteredOperations, initialCash]);

    const handlePerformCut = async () => {
        if (!selectedBranchId) return;
        setLoading(true);
        try {
            await createCashCut({
                branch_id: Number(selectedBranchId),
                user_id: 1, // Asumir usuario admin por defecto
                start_time: new Date().toISOString(), // Simulado
                initial_balance: initialCash,
                final_balance: summary.calculatedBalance, // Simulado, debería ser un conteo físico
                calculated_balance: summary.calculatedBalance,
                difference: 0, // Simulado
                notes: notes,
            });
            toast({ title: "Éxito", description: "Corte de caja realizado correctamente." });
        } catch (error) {
            console.error("Error performing cash cut:", error);
            toast({ title: "Error", description: "No se pudo realizar el corte de caja.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    return (
        <div className="flex flex-col gap-8 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Calculator className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Corte de Caja</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / Corte de Caja
                </div>
            </div>

            <Card>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center gap-2"><ClipboardEdit /> Resumen y Cierre de Caja</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Sucursal</Label>
                            <Select onValueChange={setSelectedBranchId} value={selectedBranchId}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                <SelectContent>{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Corte</Label>
                            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Efectivo inicial en Caja</Label>
                            <Input type="number" placeholder="0.00" value={initialCash} onChange={(e) => setInitialCash(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-green-100 p-4 rounded-md"><p className="text-sm text-green-800">INGRESOS</p><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIngress)}</p></div>
                        <div className="bg-red-100 p-4 rounded-md"><p className="text-sm text-red-800">EGRESOS</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalEgress)}</p></div>
                        <div className="bg-blue-100 p-4 rounded-md"><p className="text-sm text-blue-800">SALDO CALCULADO</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.calculatedBalance)}</p></div>
                    </div>
                    <div className="space-y-2">
                        <Label>Notas del Corte</Label>
                        <Textarea placeholder="Notas adicionales..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handlePerformCut} disabled={loading}><Scissors className="mr-2 h-4 w-4" /> Realizar Corte de Caja</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader><CardTitle>Detalle de Movimientos</CardTitle></CardHeader>
                <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><TrendingUp className="text-green-500"/>Ingresos</h3>
                    <div className="overflow-x-auto border rounded-md mb-6">
                        <Table>
                            <TableHeader><TableRow><TableHead>Folio/ID</TableHead><TableHead>Concepto</TableHead><TableHead>Monto</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredRecibos.map(r => <TableRow key={`rec-${r.id}`}><TableCell>Recibo #{r.id}</TableCell><TableCell>Venta a {r.patient_name}</TableCell><TableCell>{formatCurrency(r.paid)}</TableCell></TableRow>)}
                                {filteredOperations.filter(o => o.type === 'ingress').map(o => <TableRow key={`op-${o.id}`}><TableCell>Op. #{o.id}</TableCell><TableCell>{o.concept}</TableCell><TableCell>{formatCurrency(o.amount)}</TableCell></TableRow>)}
                                {filteredRecibos.length === 0 && filteredOperations.filter(o => o.type === 'ingress').length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">No hay ingresos para el día y sucursal seleccionados.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><TrendingDown className="text-red-500"/>Egresos</h3>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Concepto/Categoría</TableHead><TableHead>Monto</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredExpenses.map(e => <TableRow key={`exp-${e.id}`}><TableCell>Gasto #{e.id}</TableCell><TableCell>{e.category_name}</TableCell><TableCell>{formatCurrency(e.amount)}</TableCell></TableRow>)}
                                {filteredOperations.filter(o => o.type === 'egress').map(o => <TableRow key={`op-${o.id}`}><TableCell>Op. #{o.id}</TableCell><TableCell>{o.concept}</TableCell><TableCell>{formatCurrency(o.amount)}</TableCell></TableRow>)}
                                {filteredExpenses.length === 0 && filteredOperations.filter(o => o.type === 'egress').length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">No hay egresos para el día y sucursal seleccionados.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
