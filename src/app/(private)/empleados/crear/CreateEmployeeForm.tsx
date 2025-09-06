"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/services/employeeService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";
import { Branch } from "@/services/branchService";

// Esquema actualizado: 'branch' es ahora 'branch_id' y se valida como número.
const employeeSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  username: z.string().min(1, { message: "El nombre de usuario es requerido." }),
  email: z.string().email({ message: "Correo electrónico no válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  phone: z.string().optional(),
  branch_id: z.coerce.number({invalid_type_error: "La sucursal es requerida."}).min(1, { message: "La sucursal es requerida." }),
  position: z.string().min(1, { message: "El puesto es requerido." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// El componente recibe la lista de sucursales como una propiedad (prop).
interface CreateEmployeeFormProps {
    branches: Branch[];
}

export default function CreateEmployeeForm({ branches }: CreateEmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      position: '',
    },
  });

    const onSubmit = async (data: EmployeeFormValues) => {
        let success = false;
        loader.start("create");
        try {
            // El objeto 'data' ya tiene la estructura correcta que espera 'createEmployee'.
            await createEmployee({
                ...data,
                phone: data.phone || null,
            });
            toast({
                title: "Éxito",
                description: "Empleado creado correctamente.",
            });
            form.reset();
            success = true;
        } catch (error) {
            console.error("Error creating employee: ", error);
            toast({
                title: "Error",
                description: "No se pudo crear el empleado.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
            if (success) {
                setTimeout(() => router.push('/empleados'), 500);
            }
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
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="Contraseña" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormMessage>
            )}/>
            {/* El Select ahora se llena dinámicamente con los datos de la BD. */}
            <FormField control={form.control} name="branch_id" render={({ field }) => (
                <FormItem><FormLabel>Sucursal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)} disabled={loader.status !== 'idle'}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}>
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
                <Check className="mr-2"/> {loader.status === 'create' ? 'Guardando...' : 'Guardar'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
