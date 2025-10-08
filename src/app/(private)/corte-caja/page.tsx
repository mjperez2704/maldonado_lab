
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
    Calculator, 
    Building, 
    Calendar, 
    DollarSign, 
    ClipboardEdit, 
    RefreshCw, 
    Scissors,
    FileText,
    BadgePercent,
    ArrowRightLeft,
    ArrowDown,
    ArrowUp,
    Users
} from "lucide-react";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { getRecibos, Recibo } from "@/services/reciboServicio";
import { getExpenses, Expense } from "@/services/expenseServicio";

export default function CashCutPage() {
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [cashInBox, setCashInBox] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recibosData, expensesData] = await Promise.all([
                    getRecibos(),
                    getExpenses(),
                ]);
                setRecibos(recibosData);
                setExpenses(expensesData);

                const totalIncome = recibosData.reduce((acc, recibo) => acc + recibo.pagado, 0);
                const totalExpenses = expensesData.reduce((acc, expense) => acc + expense.amount, 0);
                setCashInBox(totalIncome - totalExpenses);

            } catch (error) {
                console.error("Error fetching data for cash cut:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

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
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <Label htmlFor="branch">Sucursal</Label>
                            <div className="relative">
                                <IconWrapper><Building /></IconWrapper>
                                <Input id="branch" value="Unidad Matriz" readOnly className="pl-10"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="cutoff-date">Fecha de Corte</Label>
                            <div className="relative">
                               <IconWrapper><Calendar /></IconWrapper>
                                <Input id="cutoff-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="pl-10"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial-cash">Efectivo inicial en Caja</Label>
                            <div className="relative">
                                <IconWrapper><DollarSign /></IconWrapper>
                                <Input id="initial-cash" type="number" placeholder="Efectivo inicial en Caja" className="pl-10" onFocus={handleFocus}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Efectivo en Caja</Label>
                            <div className="relative">
                                <IconWrapper><DollarSign /></IconWrapper>
                                <Input value={formatCurrency(cashInBox)} readOnly className="pl-10 bg-muted"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total-for-cut">Coloque el total para Corte</Label>
                            <div className="relative">
                                <IconWrapper><DollarSign /></IconWrapper>
                                <Input id="total-for-cut" type="number" placeholder="Coloque el total para Corte" className="pl-10" onFocus={handleFocus}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial-for-next">Efectivo inicial para siguiente corte</Label>
                            <div className="relative">
                               <IconWrapper><RefreshCw /></IconWrapper>
                                <Input id="initial-for-next" type="number" placeholder="Efectivo inicial para siguiente corte" className="pl-10" onFocus={handleFocus}/>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea id="notes" placeholder="Notas" />
                        </div>
                    </div>
                     <div className="flex justify-end mt-6">
                        <Button>
                            <Scissors className="mr-2 h-4 w-4" /> Realizar Corte de Caja
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center gap-2"><ClipboardEdit /> Detalle de Movimientos</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="requests">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                            <TabsTrigger value="requests"><FileText className="mr-2"/>Solicitudes</TabsTrigger>
                            <TabsTrigger value="descuentos"><BadgePercent className="mr-2"/>Descuentos Posteriores</TabsTrigger>
                            <TabsTrigger value="refunds"><ArrowRightLeft className="mr-2"/>Reembolsos</TabsTrigger>
                            <TabsTrigger value="expenses"><ArrowDown className="mr-2"/>Gastos</TabsTrigger>
                            <TabsTrigger value="income"><ArrowUp className="mr-2"/>Ingresos</TabsTrigger>
                            <TabsTrigger value="staff-payments"><Users className="mr-2"/>Pagos por Personal</TabsTrigger>
                        </TabsList>
                        <TabsContent value="requests" className="pt-4">
                           <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Folio</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Pagado</TableHead>
                                            <TableHead>Debido</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                                        ) : recibos.length > 0 ? (
                                            recibos.map(recibo => (
                                                <TableRow key={recibo.id}>
                                                    <TableCell>{recibo.barcode}</TableCell>
                                                    <TableCell>{recibo.nombrePaciente}</TableCell>
                                                    <TableCell>{formatCurrency(recibo.total)}</TableCell>
                                                    <TableCell>{formatCurrency(recibo.pagado)}</TableCell>
                                                    <TableCell>{formatCurrency(recibo.adeudo)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No hay solicitudes para mostrar.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                           </div>
                        </TabsContent>
                        <TabsContent value="descuentos" className="pt-4">
                           <p className="text-center text-muted-foreground">No hay descuentos para mostrar.</p>
                        </TabsContent>
                        <TabsContent value="refunds" className="pt-4">
                            <p className="text-center text-muted-foreground">No hay reembolsos para mostrar.</p>
                        </TabsContent>
                         <TabsContent value="expenses" className="pt-4">
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Notas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                                        ) : expenses.length > 0 ? (
                                            expenses.map(expense => (
                                                <TableRow key={expense.id}>
                                                    <TableCell>{expense.date}</TableCell>
                                                    <TableCell>{expense.categoria}</TableCell>
                                                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                                    <TableCell>{expense.notes}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No hay gastos para mostrar.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                           </div>
                        </TabsContent>
                         <TabsContent value="income" className="pt-4">
                             <p className="text-center text-muted-foreground">No hay ingresos para mostrar.</p>
                        </TabsContent>
                        <TabsContent value="staff-payments" className="pt-4">
                            <p className="text-center text-muted-foreground">No hay pagos para mostrar.</p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
        {children}
    </span>
);
