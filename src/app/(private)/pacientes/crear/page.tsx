
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Trash2, Globe, Mail, Phone, Calendar, MapPin, FileText, CreditCard, VenetianMask, FileSignature, Save } from "lucide-react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { createPatient, Patient } from "@/services/patientService";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";
import { differenceInYears, differenceInMonths, differenceInDays, parseISO, isValid, isAfter } from 'date-fns';

const patientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  nationality: z.string().min(1, "La nacionalidad es requerida."),
  ine: z.string().optional(),
  curp: z.string().optional(),
  email: z.string().email("Correo no válido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.string().min(1, "El género es requerido."),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida."),
  age: z.coerce.number().min(0, "La edad no puede ser negativa."),
  ageUnit: z.enum(['anos', 'meses', 'dias']),
  address: z.string().optional(),
  convenio: z.string().optional(),
  avatarUrl: z.string().optional(),
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
      nationality: 'mexicana',
      ine: '',
      curp: '',
      email: '',
      phone: '',
      gender: 'masculino',
      birthDate: '',
      age: 0,
      ageUnit: 'anos',
      address: '',
      convenio: '',
      avatarUrl: ''
    }
  });

  const { setValue, watch } = form;
  const watchedBirthDate = watch('birthDate');

    useEffect(() => {
        const calculateAge = (birthDate: string): { age: number; ageUnit: 'anos' | 'meses' | 'dias' } => {
            if (!birthDate) return { age: 0, ageUnit: 'anos' };

            const now = new Date();
            const birth = parseISO(birthDate);

            // Validar si la fecha es correcta y no es una fecha futura
            if (!isValid(birth) || isAfter(birth, now)) {
                return { age: 0, ageUnit: 'anos' };
            }

            const years = differenceInYears(now, birth);
            if (years >= 1) {
                return { age: years, ageUnit: 'anos' };
            }

            const months = differenceInMonths(now, birth);
            if (months >= 1) {
                return { age: months, ageUnit: 'meses' };
            }

            const days = differenceInDays(now, birth);
            return { age: days, ageUnit: 'dias' };
        };

        if (watchedBirthDate) {
            const { age, ageUnit } = calculateAge(watchedBirthDate);
            setValue('age', age, { shouldValidate: true });
            setValue('ageUnit', ageUnit, { shouldValidate: true });
        }
    }, [watchedBirthDate, setValue]);

  const onSubmit = async (data: PatientFormValues) => {
    let success = false;
    loader.start("create");
    try {
      await createPatient(data as Omit<Patient, 'id'>);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-full flex justify-between border rounded-md">
                    <Input type="file" className="border-0 focus-visible:ring-0" />
                  </div>
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <Image
                      src={form.watch('avatarUrl') || "https://placehold.co/192x192.png"}
                      alt="Avatar"
                      width={192}
                      height={192}
                      data-ai-hint="placeholder avatar"
                      className="object-cover"
                    />
                  </div>
                  <Button variant="destructive" className="w-full" type="button">
                    <Trash2 className="mr-2" />
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
              <Button type="submit" disabled={loader.status !== 'idle'}>
                <Save className="mr-2" /> {loader.status === 'create' ? 'Guardando...' : 'Guardar Paciente'}
              </Button>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Paciente</CardTitle>
                </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                      <FormField control={form.control} name="name" render={({field}) => (
                          <FormItem><FormLabel>Nombre</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><User className="h-5 w-5"/></span><FormControl><Input
                                  className="border-0 focus-visible:ring-0" {...field}
                                  disabled={loader.status !== 'idle'}/></FormControl></div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="nationality" render={({field}) => (
                          <FormItem><FormLabel>Nacionalidad</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><Globe className="h-5 w-5"/></span><Select
                                  onValueChange={field.onChange} defaultValue={field.value}
                                  disabled={loader.status !== 'idle'}><FormControl><SelectTrigger
                                  className="border-0 focus:ring-0"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem
                                  value="mexicana">Mexicana</SelectItem><SelectItem
                                  value="otra">Otra</SelectItem></SelectContent></Select></div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="ine" render={({field}) => (
                          <FormItem><FormLabel>INE/Identificación</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><CreditCard
                                  className="h-5 w-5"/></span><FormControl><Input
                                  placeholder="/Identificación" className="border-0 focus-visible:ring-0" {...field}
                                  disabled={loader.status !== 'idle'}/></FormControl></div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="curp" render={({field}) => (
                          <FormItem><FormLabel>CURP</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><FileText
                                  className="h-5 w-5"/></span><FormControl><Input placeholder="CURP"
                                                                                  className="border-0 focus-visible:ring-0" {...field}
                                                                                  disabled={loader.status !== 'idle'}/></FormControl>
                              </div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="email" render={({field}) => (
                          <FormItem><FormLabel>Correo electrónico</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><Mail className="h-5 w-5"/></span><FormControl><Input
                                  type="email" placeholder="Correo electrónico"
                                  className="border-0 focus-visible:ring-0" {...field}
                                  disabled={loader.status !== 'idle'}/></FormControl></div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="phone" render={({field}) => (
                          <FormItem><FormLabel>Número de teléfono</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><Phone
                                  className="h-5 w-5"/></span><FormControl><Input placeholder="Número de teléfono"
                                                                                  className="border-0 focus-visible:ring-0" {...field}
                                                                                  disabled={loader.status !== 'idle'}/></FormControl>
                              </div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="gender" render={({field}) => (
                          <FormItem><FormLabel>Género</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><VenetianMask
                                  className="h-5 w-5"/></span><Select
                                  onValueChange={field.onChange} defaultValue={field.value}
                                  disabled={loader.status !== 'idle'}><FormControl><SelectTrigger
                                  className="border-0 focus:ring-0"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem
                                  value="masculino">Masculino</SelectItem><SelectItem
                                  value="femenino">Femenino</SelectItem></SelectContent></Select></div>
                              <FormMessage/></FormItem>
                      )}/>
                      <div className="space-y-2">
                          <Label>Fecha de Nacimiento y Edad</Label>
                          <div className="grid grid-cols-2 gap-2">
                              <FormField control={form.control} name="birthDate" render={({field}) => (
                                  <FormItem>
                                      <div className="flex items-center border rounded-md">
                                          <span className="px-3 text-muted-foreground"><Calendar
                                              className="h-5 w-5"/></span>
                                          <FormControl>
                                              <Input type="date" className="border-0 focus-visible:ring-0" {...field}
                                                     disabled={loader.status !== 'idle'}/>
                                          </FormControl>
                                      </div>
                                      <FormMessage/>
                                  </FormItem>
                              )}/>
                              <div className="flex items-center border rounded-md bg-muted/50 cursor-not-allowed">
                                  <FormField control={form.control} name="age" render={({field}) => (
                                      <FormItem className="flex-1">
                                          <FormControl>
                                              <Input
                                                  type="number"
                                                  className="border-0 focus-visible:ring-0 bg-transparent read-only:cursor-not-allowed"
                                                  {...field}
                                                  readOnly // Campo de solo lectura
                                              />
                                          </FormControl>
                                      </FormItem>
                                  )}/>
                                  <span className="px-3 text-sm text-muted-foreground capitalize">
                                {watch('ageUnit')}
                            </span>
                              </div>
                          </div>
                      </div>
                      <FormField control={form.control} name="address" render={({field}) => (
                          <FormItem><FormLabel>Dirección</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><MapPin
                                  className="h-5 w-5"/></span><FormControl><Input placeholder="Dirección"
                                                                                  className="border-0 focus-visible:ring-0" {...field}
                                                                                  disabled={loader.status !== 'idle'}/></FormControl>
                              </div>
                              <FormMessage/></FormItem>
                      )}/>
                      <FormField control={form.control} name="convenio" render={({field}) => (
                          <FormItem><FormLabel>Convenio</FormLabel>
                              <div className="flex items-center border rounded-md"><span
                                  className="px-3 text-muted-foreground"><FileSignature
                                  className="h-5 w-5"/></span><Select
                                  onValueChange={field.onChange} defaultValue={field.value}
                                  disabled={loader.status !== 'idle'}><FormControl><SelectTrigger
                                  className="border-0 focus:ring-0"><SelectValue
                                  placeholder="Seleccionar convenio"/></SelectTrigger></FormControl><SelectContent><SelectItem
                                  value="convenio1">Convenio 1</SelectItem><SelectItem value="convenio2">Convenio
                                  2</SelectItem></SelectContent></Select></div>
                              <FormMessage/></FormItem>
                      )}/>
                  </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
