
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import {
  Plus,
  ShoppingCart
} from "lucide-react"
import { getPurchases } from '@/services/purchaseServicio';
import PurchasesTable from './PurchasesTable';

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Compras</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Compras
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de compras</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/compras/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <PurchasesTable initialPurchases={purchases} />
        </CardContent>
      </Card>
    </div>
  )
}
