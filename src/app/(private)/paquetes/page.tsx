
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
  Package as PackageIcon
} from "lucide-react"
import { getPackages } from '@/services/packageService';
import PaquetesTable from './PaquetesTable';


export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <PackageIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Paquetes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Paquetes
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de Paquetes</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/paquetes/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <PaquetesTable initialPackages={packages} />
        </CardContent>
      </Card>
    </div>
  )
}
