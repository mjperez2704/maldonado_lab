"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  Microscope
} from "lucide-react";
// Importar las nuevas interfaces y funciones del servicio refactorizado
import { getStudies, deleteStudy, Service } from '@/services/studyService';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// Definir el tipo de dato que realmente se usa en el estado
type StudyForTable = Service & { category_name: string | null };

export default function StudiesPage() {
    const [studies, setStudies] = useState<StudyForTable[]>([]);
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
                console.error("Error fetching studies: ", error);
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
            return studies;
        }
        return studies.filter(study =>
            study.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (study.code && study.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, studies]);

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este estudio? Esta acción no se puede deshacer.')) {
            try {
                await deleteStudy(id);
                setStudies(studies.filter(s => s.id !== id));
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

    const handleEdit = (id: number) => {
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
        <CardContent className="p-6 space-y-4">
            <div className="flex justify-end">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button variant="ghost" size="sm">Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                            </TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredStudies.length > 0 ? filteredStudies.map((study) => (
                        <TableRow key={study.id}>
                            <TableCell className="font-medium">{study.name}</TableCell>
                            <TableCell>{study.category_name || 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={study.type === 'PAQUETE' ? 'default' : 'secondary'}>
                                    {study.type}
                                </Badge>
                            </TableCell>
                            <TableCell>${Number(study.price || 0).toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(study.id)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(study.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No se encontraron estudios.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
