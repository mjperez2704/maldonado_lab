
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
  TestTube
} from "lucide-react"
import { getCultures } from '@/services/cultureServicio';
import CultivosTable from './CultivosTable';

export default async function CultivosPage() {
  const cultivos = await getCultures();
  
  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Cultivos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Cultivos
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de Cultivos</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/cultivos/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <CultivosTable initialCultivos={cultivos} />
        </CardContent>
      </Card>
    </div>
  )
}
