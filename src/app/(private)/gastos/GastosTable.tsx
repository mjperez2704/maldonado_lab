"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pencil,
  Trash2,
  ArrowUpDown
} from "lucide-react"
// Importar las nuevas interfaces y funciones del servicio refactorizado
import { deleteExpense, ExpenseView } from '@/services/expenseService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function GastosTable({ initialExpenses }: { initialExpenses: ExpenseView[] }) {
    const [expenses, setExpenses] = useState<ExpenseView[]>(initialExpenses);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            try {
                await deleteExpense(id);
                setExpenses(expenses.filter(e => e.id !== id));
                toast({ title: "Éxito", description: "Gasto eliminado." });
            } catch (error) {
                console.error("Error deleting expense: ", error);
                toast({ title: "Error", description: "No se pudo eliminar el gasto.", variant: "destructive" });
            }
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/gastos/editar/${id}`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(amount);
    }

    return (
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>
                        <Button variant="ghost" size="sm">Fecha <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                    </TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {expenses.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.branch_name}</TableCell>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(item.id)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}
