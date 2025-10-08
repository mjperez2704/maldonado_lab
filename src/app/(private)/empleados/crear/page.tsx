
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/services/empleadosServicio";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const employeeSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  usernombre: z.string().min(1, { message: "El nombre de usuario es requerido." }),
  email: z.string().email({ message: "Correo electrónico no válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  phone: z.string().optional(),
  branch: z.string().min(1, { message: "La sucursal es requerida." }),
  position: z.string().min(1, { message: "El puesto es requerido." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function CreateEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nombre: '',
      usernombre: '',
      email: '',
      password: '',
      phone: '',
      branch: '',
      position: '',
    },
  });

    const onSubmit = async (data: EmployeeFormValues) => {
        let success = false;
        loader.start("create");
        try {
            // El objeto que se pasa a createEmployee debe coincidir con la interfaz Employee
            const employeeData = {
                ...data,
                phone: data.phone || null, // Aseguramos que los opcionales sean null si están vacíos
            };
            await createEmployee(employeeData);
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
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/empleados" className="hover:text-primary">Empleados</Link> / Crear Empleado
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Empleado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField control={form.control} name="nombre" render={({ field }) => (
                      <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre completo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="usernombre" render={({ field }) => (
                      <FormItem><FormLabel>Nombre de usuario</FormLabel><FormControl><Input placeholder="Nombre de usuario" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="Correo electrónico" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="Contraseña" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem><FormLabel>Sucursal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loader.status !== 'idle'}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="Sucursal Principal">Sucursal Principal</SelectItem>
                                  <SelectItem value="Sucursal Secundaria">Sucursal Secundaria</SelectItem>
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
        </CardContent>
      </Card>
    </div>
  );
}
