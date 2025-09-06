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
// Importar la nueva interfaz y funciones del servicio refactorizado
import { deletePurchase, Purchase } from '@/services/purchaseService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// El tipo de dato que devuelve nuestro nuevo servicio getPurchases
type PurchaseForTable = Purchase & { provider_name: string, branch_name: string };

export default function PurchasesTable({ initialPurchases }: { initialPurchases: PurchaseForTable[] }) {
  const [purchases, setPurchases] = useState<PurchaseForTable[]>(initialPurchases);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta compra? Esta acción revertirá el stock de los productos.')) {
      try {
        await deletePurchase(id);
        setPurchases(purchases.filter(p => p.id !== id));
        toast({ title: "Éxito", description: "Compra eliminada." });
      } catch (error) {
        console.error("Error deleting purchase: ", error);
        toast({ title: "Error", description: "No se pudo eliminar la compra.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (id: number) => {
    // La edición de compras puede ser compleja, por ahora solo navegamos
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
      <div className="overflow-x-auto border rounded-md">
          <Table>
              <TableHeader>
              <TableRow>
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
                  <TableHead>Adeudo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {purchases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.branch_name}</TableCell>
                    <TableCell>{item.provider_name}</TableCell>
                    <TableCell>{formatCurrency(item.total || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.paid || 0)}</TableCell>
                    <TableCell className={item.due > 0 ? 'text-red-600 font-bold' : ''}>{formatCurrency(item.due || 0)}</TableCell>
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
    </div>
  );
}
