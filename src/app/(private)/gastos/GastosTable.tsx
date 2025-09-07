
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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Copy,
  FileSpreadsheet,
  FileText,
  FileDown,
  ChevronDown,
  Eye,
  Search,
  Settings,
  Pencil,
  Trash2,
  ArrowUpDown
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { deleteExpense, Expense } from '@/services/expenseService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function GastosTable({ initialExpenses }: { initialExpenses: Expense[] }) {
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            try {
                await deleteExpense(id);
                setExpenses(expenses.filter(e => e.id !== Number(id)));
                toast({ title: "Éxito", description: "Gasto eliminado." });
            } catch (error) {
                console.error("Error deleting expense: ", error);
                toast({ title: "Error", description: "No se pudo eliminar el gasto.", variant: "destructive" });
            }
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/gastos/editar/${id}`);
    };

    return (
        <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Mostrar 10 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuItem>10</DropdownMenuItem>
                <DropdownMenuItem>25</DropdownMenuItem>
                <DropdownMenuItem>50</DropdownMenuItem>
                <DropdownMenuItem>100</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted-foreground">registros</span>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" /> Acción masiva <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuItem>Eliminar seleccionados</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Copy className="mr-2 h-4 w-4" />Copiar</Button>
                <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" />CSV</Button>
                <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
                <Button variant="outline" size="icon"><Eye /></Button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." className="pl-10" />
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]">
                    <Checkbox />
                    </TableHead>
                    <TableHead>#</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm">Categoría <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm">Fecha <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                    </TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {expenses.map((item, index) => (
                    <TableRow key={item.id}>
                    <TableCell>
                        <Checkbox />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.amount} MXN</TableCell>
                    <TableCell>{item.paymentMethod}</TableCell>
                    <TableCell>
                        <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(String(item.id))}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(String(item.id))}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
            <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
                Mostrando 1 a {expenses.length} de {expenses.length} registros
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                    <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                    <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
        </div>
    );
}
