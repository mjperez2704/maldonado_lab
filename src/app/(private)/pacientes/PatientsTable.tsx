
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
  ChevronDown,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown
} from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { deletePatient, Patient } from '@/services/patientService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/useLoader';

export default function PatientsTable({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const handleDelete = async (id: number) => {
      if (confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
          loader.start('delete');
          try {
              await deletePatient(id);
              setPatients(patients.filter(p => p.id !== id));
              toast({ title: "Éxito", description: "Paciente eliminado." });
          } catch (error) {
              console.error("Error deleting patient: ", error);
              toast({ title: "Error", description: "No se pudo eliminar al paciente.", variant: "destructive" });
          } finally {
              loader.stop();
          }
      }
  }

  const handleEdit = (id: number) => {
    router.push(`/pacientes/editar/${id}`);
  }

  return (
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
                      <Button variant="ghost" size="sm">Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                  </TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {patients.map((item, index) => (
                  <TableRow key={item.id}>
                  <TableCell>
                      <Checkbox />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell className="capitalize">{item.gender}</TableCell>
                  <TableCell>{item.age} {item.ageUnit}</TableCell>
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
              Mostrando 1 a {patients.length} de {patients.length} registros
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
  )
}
