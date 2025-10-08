
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Plus, BadgePercent } from "lucide-react"
import { getExpenses } from '@/services/expenseServicio';
import GastosTable from './GastosTable';


export default async function ExpensesPage() {
    const expenses = await getExpenses();

    return (
        <div className="flex flex-col gap-4 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <BadgePercent className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Gastos</h1>
            </div>
            <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Gastos
            </div>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
            <CardTitle>Tabla de gastos</CardTitle>
            <Button asChild variant="secondary">
                <Link href="/gastos/crear">
                    <Plus className="mr-2 h-4 w-4" /> Crear
                </Link>
            </Button>
            </CardHeader>
            <CardContent className="p-6">
                <GastosTable initialExpenses={expenses} />
            </CardContent>
        </Card>
        </div>
    )
}
