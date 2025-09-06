"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Calendar, MapPin, VenetianMask, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/services/patientService";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

// Esquema de Zod simplificado para coincidir con la nueva BD
const patientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo no válido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['masculino', 'femenino', 'otro']).nullable(),
  birthDate: z.string().optional().nullable(),
  address: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function CreatePatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'masculino',
      birthDate: '',
      address: '',
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    let success = false;
    loader.start("create");
    try {
      // El objeto 'data' ya tiene la estructura correcta que espera el servicio
      await createPatient({
          ...data,
          email: data.email || null,
          phone: data.phone || null,
          birthDate: data.birthDate || null,
          address: data.address || null,
      });
      toast({
          title: "Éxito",
          description: "Paciente creado correctamente.",
      });
      form.reset();
      success = true;
    } catch(error) {
      console.error("Error creating patient: ", error);
      toast({
          title: "Error",
          description: "No se pudo crear el paciente.",
          variant: "destructive",
      });
    } finally {
        loader.stop();
        if (success) {
            setTimeout(() => router.push('/pacientes'), 500);
        }
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
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/pacientes" className="hover:text-primary">Pacientes</Link> / Crear paciente
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
                    <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input type="email" placeholder="email@ejemplo.com" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({field}) => (
                    <FormItem><FormLabel>Número de teléfono</FormLabel><FormControl><Input placeholder="55 1234 5678" {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="gender" render={({field}) => (
                    <FormItem><FormLabel>Género</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={loader.status !== 'idle'}><FormControl><SelectTrigger><SelectValue placeholder="Seleccionar género"/></SelectTrigger></FormControl><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="femenino">Femenino</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="birthDate" render={({field}) => (
                    <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({field}) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Calle, número, colonia..." {...field} disabled={loader.status !== 'idle'}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>
              <div className="flex justify-start pt-4">
                <Button type="submit" disabled={loader.status !== 'idle'}>
                  <Save className="mr-2 h-4 w-4" /> {loader.status === 'create' ? 'Guardando...' : 'Guardar Paciente'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
