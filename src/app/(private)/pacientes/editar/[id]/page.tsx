"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save } from "lucide-react";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPatientById, updatePatient, Patient } from "@/services/patientService";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";
import { format } from 'date-fns';

// Esquema de Zod simplificado
const patientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo no válido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['masculino', 'femenino', 'otro']).nullable(),
  birthDate: z.string().optional().nullable(),
  address: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = Number(params.id);
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: null,
      birthDate: '',
      address: '',
    },
  });

  useEffect(() => {
    if (patientId) {
      loader.start('read');
      getPatientById(patientId)
        .then((patientData) => {
          if (patientData) {
            // Formatear la fecha para el input type="date" (YYYY-MM-DD)
            const formattedBirthDate = patientData.birthDate
              ? format(new Date(patientData.birthDate), 'yyyy-MM-dd')
              : '';

            form.reset({
                ...patientData,
                email: patientData.email || '',
                phone: patientData.phone || '',
                birthDate: formattedBirthDate,
                address: patientData.address || '',
            });
          } else {
            toast({ title: "Error", description: "Paciente no encontrado.", variant: "destructive" });
            router.push('/pacientes');
          }
        })
        .catch(error => {
          console.error("Error fetching patient:", error);
          toast({ title: "Error", description: "No se pudieron cargar los datos del paciente.", variant: "destructive" });
        })
        .finally(() => loader.stop());
    }
  }, [patientId, router, form, toast, loader]);

  const onSubmit = async (data: PatientFormValues) => {
    loader.start("update");
    try {
        await updatePatient(patientId, {
            ...data,
            email: data.email || null,
            phone: data.phone || null,
            birthDate: data.birthDate || null,
            address: data.address || null,
        });
      toast({
        title: "Éxito",
        description: "Paciente actualizado correctamente.",
      });
      router.push('/pacientes');
    } catch(error) {
      console.error("Error updating patient: ", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente.",
        variant: "destructive",
      });
    } finally {
        loader.stop();
    }
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Pacientes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/pacientes" className="hover:text-primary">Pacientes</Link> / Editar paciente
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Nombre del paciente" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({field}) => (
                    <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="email@ejemplo.com" {...field} value={field.value || ''} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({field}) => (
                    <FormItem><FormLabel>Número de teléfono</FormLabel><FormControl><Input placeholder="55 1234 5678" {...field} value={field.value || ''} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="gender" render={({field}) => (
                    <FormItem><FormLabel>Género</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar género"/></SelectTrigger></FormControl><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="femenino">Femenino</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="birthDate" render={({field}) => (
                    <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({field}) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Calle, número, colonia..." {...field} value={field.value || ''} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>
              <div className="flex justify-start pt-4">
                <Button type="submit" disabled={loader.status !== 'idle'}>
                  <Save className="mr-2 h-4 w-4" /> {loader.status === 'update' ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
