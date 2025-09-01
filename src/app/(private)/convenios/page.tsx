import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Plus } from "lucide-react"
import { getConvenios } from '@/services/convenioService';
import ConveniosTable from './ConveniosTable';


const HandshakeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-handshake h-8 w-8 text-primary"
    >
      <path d="M11 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1" />
      <path d="M13 17a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
      <path d="M12.5 17.1L11 15.5" />
      <path d="M8.5 12.8L10 11.3" />
      <path d="m15 11.3 1.5 1.5" />
      <path d="m3 7 3 3" />
      <path d="m18 7 3 3" />
    </svg>
);

export default async function ConveniosPage() {
  const convenios = await getConvenios();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <HandshakeIcon />
            <h1 className="text-2xl font-bold">Convenios</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Convenios
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle>Tabla de convenios</CardTitle>
          <Button asChild variant="secondary">
            <Link href="/convenios/crear">
                <Plus className="mr-2 h-4 w-4" /> Crear
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
            <ConveniosTable initialConvenios={convenios} />
        </CardContent>
      </Card>
    </div>
  )
}
