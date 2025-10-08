
"use client";

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import Link from "next/link";
import {
  Plus,
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
  ClipboardList,
  ArrowUpDown
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getCultureOptions, deleteCultureOption, CultureOption } from '@/services/cultureOptionServicio';
import { useRouter } from 'next/navigation';

export default function CultureOptionsPage() {
  const [cultureOptions, setCultureOptions] = useState<CultureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCultureOptions = async () => {
      try {
        const data = await getCultureOptions();
        setCultureOptions(data);
      } catch (error) {
        console.error("Error fetching culture options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCultureOptions();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta opción?')) {
      try {
        await deleteCultureOption(id);
        setCultureOptions(cultureOptions.filter(o => o.id !== Number(id)));
      } catch (error) {
        console.error("Error deleting culture option: ", error);
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Opciones de cultivo</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Opciones de cultivo
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tabla de opciones de cultivos</CardTitle>
          <Button asChild>
            <Link href="/cultivos/opciones/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
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
              </div>
              <div className="flex items-center gap-2">
                    <Button variant="outline"><Copy className="mr-2 h-4 w-4" />Copiar</Button>
                    <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
                    <Button variant="outline"><FileText className="mr-2 h-4 w-4" />CSV</Button>
                    <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
                    <Button variant="outline" size="icon"><Eye /></Button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10" />
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
                            <Button variant="ghost" size="sm">Título <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                        </TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cultureOptions.map((item, index) => (
                        <TableRow key={item.id}>
                        <TableCell>
                            <Checkbox />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" disabled>
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
                    Mostrando 1 a {cultureOptions.length} de {cultureOptions.length} registros
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
        </CardContent>
      </Card>
    </div>
  )
}
