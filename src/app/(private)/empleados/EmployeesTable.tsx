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
import { Pencil, Trash2 } from "lucide-react"
// Importamos la interfaz correcta (EmployeeView) y la función deleteEmployee
import { deleteEmployee, EmployeeView } from '@/services/employeeService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/useLoader';

// El componente ahora espera recibir la interfaz EmployeeView
export default function EmployeesTable({ initialEmployees }: { initialEmployees: EmployeeView[] }) {
  const [employees, setEmployees] = useState<EmployeeView[]>(initialEmployees);
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      loader.start('delete');
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter(e => e.id !== id));
        toast({ title: "Éxito", description: "Empleado eliminado." });
      } catch (error) {
        console.error("Error deleting employee: ", error);
        toast({ title: "Error", description: "No se pudo eliminar al empleado.", variant: "destructive" });
      } finally {
        loader.stop();
      }
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/empleados/editar/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NOMBRE</TableHead>
            <TableHead>PUESTO</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>SUCURSAL</TableHead>
            <TableHead>ACCIONES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.email}</TableCell>
              {/* Campo corregido para mostrar el nombre de la sucursal */}
              <TableCell>{employee.branchName}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(employee.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(employee.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
