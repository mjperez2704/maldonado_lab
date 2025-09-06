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
  User,
  Hash,
  Filter,
} from "lucide-react"
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { getQuotes, deleteQuote, updateQuoteStatus, getQuoteById, Quote } from '@/services/quoteService';
import { createRecibo } from '@/services/reciboService';

// El tipo de dato que devuelve nuestro nuevo servicio getQuotes
type QuoteForTable = Quote & { patient_name: string };

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<QuoteForTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '' });
    const router = useRouter();
    const { toast } = useToast();

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const data = await getQuotes();
            setQuotes(data);
        } catch (error) {
            console.error("Error fetching quotes: ", error);
            toast({ title: "Error", description: "No se pudieron cargar las cotizaciones.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const folioMatch = filters.folio ? String(quote.id).includes(filters.folio) : true;
            const patientMatch = filters.patient ? quote.patient_name.toLowerCase().includes(filters.patient.toLowerCase()) : true;
            return folioMatch && patientMatch;
        });
    }, [quotes, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleDelete = async (id: number) => {
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

    const handleConvertToRequest = async (quote: QuoteForTable) => {
        if (quote.status === 'converted') {
            return toast({ title: "Atención", description: "Esta cotización ya ha sido convertida."});
        }

        try {
            // 1. Obtener los detalles completos de la cotización
            const quoteDetails = await getQuoteById(quote.id);
            if (!quoteDetails || !quoteDetails.details) {
                throw new Error("No se encontraron los detalles de la cotización.");
            }

            // 2. Construir el objeto para createRecibo
            const reciboData = {
                patient_id: quote.patient_id,
                doctor_id: null, // No hay doctor en la cotización, se puede añadir en la solicitud
                branch_id: 1, // Asumir sucursal principal por defecto
                created_by_id: 1, // Asumir usuario admin por defecto
                subtotal: quote.total || 0,
                discount: 0,
                total: quote.total || 0,
                paid: 0, // El pago se realiza en la solicitud
                details: quoteDetails.details.map(d => ({
                    item_type: d.item_type,
                    item_id: d.item_id,
                    price: d.price,
                    quantity: d.quantity,
                }))
            };

            // 3. Crear el recibo
            const newReciboId = await createRecibo(reciboData);

            // 4. Actualizar el estado de la cotización
            await updateQuoteStatus(quote.id, 'converted');

            toast({ title: "Éxito", description: `La cotización ha sido convertida a la solicitud #${newReciboId}.` });
            fetchQuotes(); // Refrescar la lista
            // Opcional: redirigir a la nueva solicitud/recibo
            // router.push(`/solicitud-examenes/editar/${newReciboId}`);

        } catch (error) {
            console.error("Error converting quote to request:", error);
            toast({ title: "Error", description: "No se pudo convertir la cotización.", variant: "destructive"});
        }
    };

    const handleEdit = (id: number) => {
        // La edición de cotizaciones puede deshabilitarse o requerir una página de edición refactorizada
        toast({ title: "Info", description: "La edición de cotizaciones está deshabilitada temporalmente." });
        // router.push(`/cotizaciones/editar/${id}`);
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
          <CardTitle className="flex items-center gap-2"><Filter /> Filtros de Búsqueda</CardTitle>
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
                <div className="flex items-center gap-2"><Newspaper /> Listado de Cotizaciones</div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/cotizaciones/crear"><Plus className="mr-2"/> Registrar nueva Cotización</Link>
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
                                <TableCell>#{quote.id}</TableCell>
                                <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                                <TableCell>{quote.patient_name}</TableCell>
                                <TableCell>${(quote.total || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${quote.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                        {quote.status === 'pending' ? 'Pendiente' : 'Convertida'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button variant="outline" size="icon" title="Convertir a Solicitud" onClick={() => handleConvertToRequest(quote)} disabled={quote.status === 'converted'}>
                                        <FileCheck className="h-4 w-4 text-green-600"/>
                                    </Button>
                                    <Button variant="outline" size="icon" title="Editar Cotización" onClick={() => handleEdit(quote.id)} disabled={quote.status === 'converted'}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="destructive" size="icon" title="Eliminar Cotización" onClick={() => handleDelete(quote.id)}>
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
