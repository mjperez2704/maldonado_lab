
import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import {
  Plus,
  Users
} from "lucide-react"
import { getPatients } from '@/services/patientService';
import { Patient } from '@/services/patientService';
import PatientsTable from './PatientsTable';

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Pacientes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Pacientes
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de Pacientes</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/pacientes/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear Paciente
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <PatientsTable initialPatients={patients} />
        </CardContent>
      </Card>
    </div>
  )
}
