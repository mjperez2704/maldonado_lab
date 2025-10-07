
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {
  Plus,
  Search,
  Newspaper,
  Pencil,
  Trash2,
  FileCheck,
  Calendar,
  User,
  Hash,
  Filter,
} from "lucide-react"
import { getQuotes, deleteQuote, updateQuote, Quote } from '@/services/quoteService';
import { createRecibo } from '@/services/reciboService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '' });
    const router = useRouter();
    const { toast } = useToast();

    const fetchQuotes = async () => {
        try {
            const data = await getQuotes();
            setQuotes(data);
        } catch (error) {
            console.error("Error fetching quotes: ", error);
            toast({ title: "Error", description: "No se pudieron cargar las cotizaciones." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const folioMatch = filters.folio ? quote.id.toString().toLowerCase().includes(filters.folio.toLowerCase()) : true;
            const patientMatch = filters.patient ? quote.patientName.toLowerCase().includes(filters.patient.toLowerCase()) : true;
            return folioMatch && patientMatch;
        });
    }, [quotes, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
            try {
                await deleteQuote(id);
                toast({ title: "Éxito", description: "Cotización eliminada." });
                fetchQuotes();
            } catch (error) {
                console.error("Error deleting quote: ", error);
                toast({ title: "Error", description: "No se pudo eliminar la cotización.", variant: "destructive" });
            }
        }
    };

    const handleConvertToRequest = async (quote: Quote) => {
        if (quote.status === 'converted') {
            toast({ title: "Atención", description: "Esta cotización ya ha sido convertida."});
            return;
        }

        try {
            await createRecibo({
                patientCode: quote.patientId,
                patientName: quote.patientName,
                estudios: quote.estudios,
                paquetes: quote.paquetes,
                subtotal: quote.subtotal,
                descuento: quote.descuento,
                total: quote.total,
                pagado: 0,
                adeudo: quote.total,
            });

            await updateQuote(String(quote.id), { status: 'converted' });

            toast({ title: "Éxito", description: `La cotización ${quote.id.toString().substring(0,8)} ha sido convertida a solicitud.` });
            fetchQuotes(); // Refresh the list to show the new status
            router.push('/facturacion'); // Navigate to the billing/receipts page

        } catch (error) {
            console.error("Error converting quote to request:", error);
            toast({ title: "Error", description: "No se pudo convertir la cotización.", variant: "destructive"});
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/cotizaciones/editar/${id}`);
    };

  return (
    <div className="flex flex-col gap-8 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Newspaper className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Cotizaciones</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Hogar</Link> / Cotizaciones
            </div>
        </div>
      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter /> Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <label htmlFor="folio">Folio</label>
              <div className="relative">
                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="folio" placeholder="Folio de la cotización" className="pl-10" value={filters.folio} onChange={handleFilterChange} />
              </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="patient">Paciente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="patient" placeholder="Nombre del Paciente" className="pl-10" value={filters.patient} onChange={handleFilterChange} />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper /> Listado de Cotizaciones
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/cotizaciones/crear">
                        <Plus className="mr-2"/> Registrar nueva Cotización
                    </Link>
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Folio</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
                    ) : filteredQuotes.length > 0 ? (
                        filteredQuotes.map(quote => (
                            <TableRow key={quote.id}>
                                <TableCell>{quote.id.toString().substring(0, 8)}</TableCell>
                                <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                                <TableCell>{quote.patientName}</TableCell>
                                <TableCell>${Number(quote.total.toFixed(2))}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${quote.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                        {quote.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button variant="outline" size="icon" title="Convertir a Solicitud" onClick={() => handleConvertToRequest(quote)} disabled={quote.status === 'converted'}>
                                        <FileCheck className="h-4 w-4 text-green-600"/>
                                    </Button>
                                    <Button variant="outline" size="icon" title="Editar Cotización" onClick={() => handleEdit(String(quote.id))} disabled={quote.status === 'converted'}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="destructive" size="icon" title="Eliminar Cotización" onClick={() => handleDelete(String(quote.id))}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No se encontraron cotizaciones.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
