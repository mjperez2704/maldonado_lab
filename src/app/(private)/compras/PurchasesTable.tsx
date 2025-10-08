
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
import { deletePurchase, Purchase } from '@/services/comprasServicio';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function PurchasesTable({ initialPurchases }: { initialPurchases: Purchase[] }) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta compra?')) {
      try {
        await deletePurchase(id);
        setPurchases(purchases.filter(p => p.id !== Number(id)));
        toast({ title: "Éxito", description: "Compra eliminada." });
      } catch (error) {
        console.error("Error deleting purchase: ", error);
        toast({ title: "Error", description: "No se pudo eliminar la compra.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/compras/editar/${id}`);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

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
                      <Button variant="ghost" size="sm">Fecha <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" size="sm">Sucursal <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>
                       <Button variant="ghost" size="sm">Proveedor <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Debido</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {purchases.map((item, index) => (
                  <TableRow key={item.id}>
                  <TableCell>
                      <Checkbox />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.provider}</TableCell>
                  <TableCell>{formatCurrency(item.total || 0)}</TableCell>
                  <TableCell>{formatCurrency(item.pagado || 0)}</TableCell>
                  <TableCell>{formatCurrency(item.adeudo || 0)}</TableCell>
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
              Mostrando 1 a {purchases.length} de {purchases.length} registros
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
