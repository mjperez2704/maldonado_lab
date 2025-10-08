
"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
  Upload,
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
  ArrowUpDown,
  Microscope
} from "lucide-react"
import { getStudies, deleteEstudio, Estudio } from '@/services/estudiosServicio';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


export default function StudiesPage() {
    const [estudios, setStudies] = useState<Estudio[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchStudies = async () => {
            setLoading(true);
            try {
                const data = await getStudies();
                setStudies(data);
            } catch (error) {
                console.error("Error fetching estudios: ", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los estudios.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudies();
    }, [toast]);

    const filteredStudies = useMemo(() => {
        if (!searchTerm) {
            return estudios;
        }
        return estudios.filter(study =>
            study.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (study.code && study.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, estudios]);


    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este estudio? Esta acción no se puede deshacer.')) {
            try {
                await deleteEstudio(id);
                setStudies(estudios.filter(s => s.id !== Number(id)));
                toast({
                    title: "Éxito",
                    description: "Estudio eliminado correctamente.",
                });
            } catch (error) {
                console.error("Error deleting study: ", error);
                toast({
                    title: "Error",
                    description: "No se pudo eliminar el estudio.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/estudios/editar/${id}`);
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full">Cargando estudios...</div>;
    }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Microscope className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Estudios</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Estudios
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de estudios</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/estudios/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-primary/10 rounded-lg">
                <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Upload className="mr-2 h-4 w-4" /> Importación / Exportación
                </Button>
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
                <Input
                    placeholder="Buscar por nombre o código..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">
                        <Checkbox />
                        </TableHead>
                        <TableHead className="w-[80px]">#</TableHead>
                        <TableHead>
                            <Button variant="ghost" size="sm">Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                        </TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Costo Interno</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredStudies.length > 0 ? filteredStudies.map((study, index) => (
                        <TableRow key={study.id}>
                        <TableCell>
                            <Checkbox />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{study.nombre}</TableCell>
                        <TableCell>{study.area}</TableCell>
                        <TableCell>{study.method || 'N/A'}</TableCell>
                            <TableCell>${Number((study.internalCost || 0)).toFixed(2)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(String(study.id))}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(String(study.id))}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                No se encontraron estudios.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Mostrando 1 a {filteredStudies.length} de {estudios.length} registros
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
