
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, UserCheck } from "lucide-react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getEmployeeById, updateEmployee } from "@/services/empleadosServicio";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const employeeSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  usuario: z.string().min(1, { message: "El nombre de usuario es requerido." }),
  email: z.string().email({ message: "Correo electrónico no válido." }),
  contrasena: z.string().optional(),
  telefono: z.string().optional(),
  sucursal_id: z.string().min(1, { message: "La sucursal es requerida." }),
  puesto: z.string().min(1, { message: "El puesto es requerido." }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;


export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = Number(params.id);
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nombre: '',
      usuario: '',
      email: '',
      contrasena: '',
      telefono: '',
      sucursal_id: '',
      puesto: '',
    },
  });

  useEffect(() => {
    if (employeeId) {
      loader.start('read');
      getEmployeeById(employeeId).then(data => {
        if(data) {
          form.reset({ 
              ...data, 
              contrasena: '', // Don't pre-fill password
              telefono: data.telefono || ''
            });
        } else {
          toast({ title: "Error", description: "Empleado no encontrado.", variant: "destructive" });
          router.push('/empleados');
        }
      }).catch(error => {
        console.error("Error fetching employee:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos del empleado.", variant: "destructive" });
      }).finally(() => loader.stop());
    }
  }, [employeeId, router, form.reset, toast, loader.start, loader.stop]);

  const onSubmit = async (data: EmployeeFormValues) => {
    loader.start("update");
    try {
      const role_id = data.puesto === 'Administrador de Sistema' ? 1 : 2;
      const updateData: any = { ...data, role_id };
      if (!updateData.contrasena) {
        delete updateData.contrasena;
      }
      
      await updateEmployee(employeeId, updateData);
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
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/empleados" className="hover:text-primary">Empleados</Link> / Editar Empleado
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Empleado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField control={form.control} name="nombre" render={({ field }) => (
                      <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre completo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="usuario" render={({ field }) => (
                      <FormItem><FormLabel>Nombre de usuario</FormLabel><FormControl><Input placeholder="Nombre de usuario" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="Correo electrónico" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="contrasena" render={({ field }) => (
                      <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="Dejar en blanco para no cambiar" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="telefono" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Número de teléfono" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="sucursal_id" render={({ field }) => (
                      <FormItem><FormLabel>Sucursal</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loader.status !== 'idle'}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="Sucursal Principal">Sucursal Principal</SelectItem>
                                  <SelectItem value="Sucursal Secundaria">Sucursal Secundaria</SelectItem>
                              </SelectContent>
                          </Select>
                      <FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="puesto" render={({ field }) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
