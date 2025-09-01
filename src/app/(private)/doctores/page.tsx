
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
  PlusSquare
} from "lucide-react"
import { getDoctors } from '@/services/doctorService';
import DoctorsTable from './DoctorsTable';


export default async function DoctorsPage() {
    const doctors = await getDoctors();

    return (
        <div className="flex flex-col gap-4 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <PlusSquare className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Doctores</h1>
            </div>
            <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Doctores
            </div>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
            <CardTitle>Mesa de doctores</CardTitle>
            <Button asChild variant="secondary">
                <Link href="/doctores/crear">
                    <Plus className="mr-2 h-4 w-4" /> Crear
                </Link>
            </Button>
            </CardHeader>
            <CardContent className="p-6">
                <DoctorsTable initialDoctors={doctors} />
            </CardContent>
        </Card>
        </div>
    )
}
