
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Landmark,
  ClipboardPlus,
  History,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  BookOpen,
  DollarSign
} from "lucide-react";
import React, { useEffect, useState } from 'react';
import { createOperation, getOperations, deleteOperation, Operation } from '@/services/operationService';
import { getRecibos, Recibo } from "@/services/reciboService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type OperationFormData = Omit<Operation, 'id'>;

type CombinedTransaction = {
    id: string;
    date: string;
    concept: string;
    type: 'ingress' | 'egress';
    amount: number;
    source: 'manual' | 'solicitud';
};

export default function IncomeAndExpensesPage() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);
    const [formData, setFormData] = useState<OperationFormData>({
        date: new Date().toISOString().slice(0, 16),
        concept: '',
        employee: '',
        amount: 0,
        paymentMethod: '',
        type: 'ingress',
    });
    const [summary, setSummary] = useState({
        ingress: 0,
        egress: 0,
        balance: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const [ops, recibos] = await Promise.all([getOperations(), getRecibos()]);
            
            const manualTransactions: CombinedTransaction[] = ops.map(op => ({
                id: `op-${op.id}`,
                date: op.date,
                concept: op.concept,
                type: op.type,
                amount: op.amount,
                source: 'manual'
            }));

            const automaticIncomes: CombinedTransaction[] = recibos
                .filter(recibo => recibo.paid > 0)
                .map(recibo => ({
                    id: `rec-${recibo.id}`,
                    date: recibo.date,
                    concept: `Pago Solicitud Folio #${recibo.barcode}`,
                    type: 'ingress',
                    amount: recibo.paid,
                    source: 'solicitud'
                }));
            
            const allTransactions = [...manualTransactions, ...automaticIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(allTransactions);

        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast({ title: "Error", description: "No se pudieron cargar las operaciones.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const ingress = transactions.filter(t => t.type === 'ingress').reduce((acc, t) => acc + t.amount, 0);
        const egress = transactions.filter(t => t.type === 'egress').reduce((acc, t) => acc + t.amount, 0);
        setSummary({
            ingress,
            egress,
            balance: ingress - egress,
        });
    }, [transactions]);


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSelectChange = (id: 'employee' | 'paymentMethod' | 'type', value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleAddOperation = async () => {
        if(!formData.concept || formData.amount <= 0 || !formData.paymentMethod) {
            toast({ title: "Campos incompletos", description: "Por favor, complete todos los campos requeridos.", variant: "destructive"});
            return;
        }
        try {
            await createOperation(formData);
            toast({ title: "Éxito", description: "Operación registrada correctamente." });
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                concept: '',
                employee: '',
                amount: 0,
                paymentMethod: '',
                type: 'ingress',
            });
            fetchTransactions(); // Refrescar la lista
        } catch (error) {
             console.error("Error creating operation:", error);
             toast({ title: "Error", description: "No se pudo registrar la operación.", variant: "destructive"});
        }
    };

    const handleDeleteOperation = async (id: string, source: 'manual' | 'solicitud') => {
        if (source === 'solicitud') {
            toast({ title: "Acción no permitida", description: "Los ingresos de solicitudes no se pueden eliminar desde esta pantalla.", variant: "default"});
            return;
        }

        if (confirm('¿Está seguro de que desea eliminar esta operación?')) {
            try {
                const operationId = id.replace('op-', '');
                await deleteOperation(operationId);
                toast({ title: "Éxito", description: "Operación eliminada." });
                fetchTransactions(); // Refrescar la lista
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
          <h1 className="text-2xl font-bold">Ingresos y Egresos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Ingresos y Egresos
        </div>
      </div>

      <div className="bg-blue-100 border border-blue-300 text-blue-800 p-3 rounded-md">
        Operaciones correspondientes a la Sucursal Unidad Matriz
      </div>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <ClipboardPlus /> Registrar Operación Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="date" type="datetime-local" value={formData.date} onChange={handleFormChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="concept">Concepto</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="concept" placeholder="Concepto" value={formData.concept} onChange={handleFormChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleFormChange} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="payment-method">Forma de Pago</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                    <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Forma de Pago" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="operation-type">Operación</Label>
                 <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value as 'ingress' | 'egress')}>
                    <SelectTrigger id="operation-type">
                        <SelectValue placeholder="Operación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ingress">Ingreso</SelectItem>
                        <SelectItem value="egress">Egreso</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddOperation}>
              Agregar Operación
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <History /> Historial de Operaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                    </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((op) => (
                    <TableRow key={op.id}>
                        <TableCell>{new Date(op.date).toLocaleString()}</TableCell>
                        <TableCell>{op.concept}</TableCell>
                        <TableCell className="flex items-center gap-1">
                            {op.type === 'ingress' ?
                                <TrendingUp className="h-4 w-4 text-green-500" /> :
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            }
                            <span className="capitalize">{op.type === 'ingress' ? 'Ingreso' : 'Egreso'}</span>
                        </TableCell>
                        <TableCell>${Number(op.amount.toFixed(2))}</TableCell>
                        <TableCell>
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => handleDeleteOperation(op.id, op.source)}
                                disabled={op.source === 'solicitud'}
                                title={op.source === 'solicitud' ? 'No se puede eliminar un ingreso automático' : 'Eliminar operación'}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No hay operaciones registradas.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted">
            <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-md shadow">
                <p className="text-sm text-muted-foreground">TOTAL DE INGRESOS</p>
                <p className="text-2xl font-bold text-green-600">${Number(summary.ingress.toFixed(2))}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
                <p className="text-sm text-muted-foreground">TOTAL DE EGRESOS</p>
                <p className="text-2xl font-bold text-red-600">${Number(summary.egress.toFixed(2))}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
                <p className="text-sm text-muted-foreground">SALDO FINAL</p>
                <p className="text-2xl font-bold text-primary">${Number(summary.balance.toFixed(2))}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
