
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Plus, Boxes } from "lucide-react"
import { getProducts } from '@/services/productosServicio';
import ProductsTable from './ProductsTable';


export default async function ProductsPage() {
    const products = await getProducts();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Boxes className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Productos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Productos
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de Productos</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/productos/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <ProductsTable initialProducts={products} />
        </CardContent>
      </Card>
    </div>
  )
}
