
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import {
  Filter,
  Search,
  CaseSensitive,
  UserCircle,
  Plus,
  UserCheck,
} from "lucide-react"
import { getEmployees } from '@/services/empleadosServicio';
import EmployeesTable from './EmployeesTable';

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="flex flex-col gap-8 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <UserCheck className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Empleados</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Hogar</Link> / Empleados
            </div>
        </div>
      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter /> Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nombre o Apellido" className="pl-10" />
              </div>
            </div>
             <div className="space-y-2">
                <div className="relative">
                    <CaseSensitive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Puesto" className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nombre de Usuario" className="pl-10" />
                </div>
            </div>
          </div>
           <div className="flex justify-end mt-4">
                <Button><Search className="mr-2" /> Buscar</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <UserCheck /> Listado de Empleados
            </div>
            <Button asChild>
                <Link href="/empleados/crear">
                    <Plus className="mr-2"/> Nuevo Empleado
                </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-4">
            <EmployeesTable initialEmployees={employees} />
        </CardContent>
      </Card>
    </div>
  );
}
