
"use client";

import { CreatePatientForm } from '../CreatePatientForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function CreatePatientPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/pacientes');
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
            <CardTitle>Crear Paciente</CardTitle>
        </CardHeader>
        <CardContent>
            <CreatePatientForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
