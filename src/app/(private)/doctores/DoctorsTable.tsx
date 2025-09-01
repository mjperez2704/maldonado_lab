
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
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  Copy,
  FileSpreadsheet,
  FileText,
  FileDown,
  ChevronDown,
  Eye,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { deleteDoctor, Doctor } from '@/services/doctorService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/useLoader';

export default function DoctorsTable({ initialDoctors }: { initialDoctors: Doctor[] }) {
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const router = useRouter();
    const { toast } = useToast();
    const loader = useLoader();

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este doctor?')) {
            loader.start('delete');
            try {
                await deleteDoctor(id);
                setDoctors(doctors.filter(d => d.id !== id));
                toast({ title: "Éxito", description: "Doctor eliminado." });
            } catch (error) {
                console.error("Error deleting doctor: ", error);
                toast({ title: "Error", description: "No se pudo eliminar al doctor.", variant: "destructive" });
            } finally {
                loader.stop();
            }
        }
    };
    
    const handleEdit = (id: number) => {
        router.push(`/doctores/editar/${id}`);
    };

    return (
        <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-primary/10 rounded-lg">
            <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" /> Importación y exportación
            </Button>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Copy className="mr-2 h-4 w-4" />Dupdo</Button>
                <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" />Sobresalir</Button>
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" />CVS</Button>
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
            <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Buscar:</span>
            <Input placeholder="" className="w-auto" />
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
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo electrónico</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Debido</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {doctors.map((item, index) => (
                    <TableRow key={item.id}>
                    <TableCell>
                        <Checkbox />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.address}</TableCell>
                    <TableCell>{item.commission}%</TableCell>
                    <TableCell>{item.total} MXN</TableCell>
                    <TableCell>{item.paid} MXN</TableCell>
                    <TableCell className="text-red-500">{item.due} MXN</TableCell>
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
            <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
                Demostración {doctors.length > 0 ? 1 : 0} a {doctors.length} de {doctors.length} registros
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
    );
}
