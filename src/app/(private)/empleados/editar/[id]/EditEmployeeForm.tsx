"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateEmployee, Employee } from "@/services/employeeService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";
import { Branch } from "@/services/branchService";

// Esquema corregido para usar branch_id
const employeeSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  username: z.string().min(1, { message: "El nombre de usuario es requerido." }),
  email: z.string().email({ message: "Correo electrónico no válido." }),
  password: z.string().optional(),
  phone: z.string().optional(),
  branch_id: z.coerce.number({invalid_type_error: "La sucursal es requerida."}).min(1, { message: "La sucursal es requerida." }),
  position: z.string().min(1, { message: "El puesto es requerido." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EditEmployeeFormProps {
    branches: Branch[];
    employee: Omit<Employee, 'password'>; // Recibe los datos iniciales del empleado
}

export default function EditEmployeeForm({ branches, employee }: EditEmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    // Poblar el formulario con los datos del empleado que recibimos
    defaultValues: {
      ...employee,
      phone: employee.phone || '',
      password: '', // Nunca pre-llenar la contraseña
    },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    loader.start("update");
    try {
      const updateData: Partial<EmployeeFormValues> = { ...data };

      // No enviar el campo de contraseña si está vacío
      if (!updateData.password) {
        delete updateData.password;
      }

      await updateEmployee(employee.id, updateData);
      toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente.",
      });
      router.push('/empleados');
    } catch (error) {
      console.error("Error updating employee: ", error);
      toast({
          title: "Error",
          description: "No se pudo actualizar el empleado.",
          variant: "destructive",
      });
    } finally {
        loader.stop();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre completo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>Nombre de usuario</FormLabel><FormControl><Input placeholder="Nombre de usuario" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="Correo electrónico" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="Dejar en blanco para no cambiar" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            {/* Select dinámico */}
            <FormField control={form.control} name="branch_id" render={({ field }) => (
                <FormItem><FormLabel>Sucursal</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)} disabled={loader.status !== 'idle'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {branches.map(branch => (
                                <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="position" render={({ field }) => (
                <FormItem><FormLabel>Puesto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar puesto" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Administrador de Sistema">Administrador de Sistema</SelectItem>
                            <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                            <SelectItem value="Químico Analista">Químico Analista</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
            )}/>
        </div>

        <div className="flex justify-start">
            <Button type="submit" disabled={loader.status !== 'idle'}>
                <Check className="mr-2"/> {loader.status === 'update' ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
