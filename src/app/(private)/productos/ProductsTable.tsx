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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Pencil,
  Trash2,
  ArrowUpDown
} from "lucide-react"
// La interfaz Product ya es la correcta gracias a la corrección del servicio
import { deleteProduct, Product } from '@/services/productService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/useLoader';

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            loader.start('delete');
            try {
                await deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
                toast({ title: "Éxito", description: "Producto eliminado." });
            } catch (error) {
                console.error("Error deleting product: ", error);
                toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
            } finally {
                loader.stop();
            }
        }
    };
    
    const handleEdit = (id: number) => {
        router.push(`/productos/editar/${id}`);
    };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o SKU..." className="pl-10" />
        </div>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>
                      <Button variant="ghost" size="sm">SKU <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" size="sm">Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Costo Compra</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {products.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.sku || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell>${(item.price || 0).toFixed(2)}</TableCell>
                    <TableCell>${(item.cost || 0).toFixed(2)}</TableCell>
                    <TableCell>
                        <span className={item.stock <= item.stock_alert ? 'text-red-600 font-bold' : ''}>
                            {item.stock}
                        </span>
                    </TableCell>
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
  )
}
