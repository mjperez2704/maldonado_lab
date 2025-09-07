
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar, Hash, User, NotebookTabs, Plus, Trash2, FileEdit } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from 'react';
import { getCreditNotes, deleteCreditNote, CreditNote } from "@/services/creditNoteService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
      folio: '',
      patient: '',
      startDate: '2025-06-01',
      endDate: new Date().toISOString().split('T')[0],
      status: 'active'
  });

  const fetchCreditNotes = async () => {
      setLoading(true);
      try {
          const data = await getCreditNotes();
          setCreditNotes(data);
      } catch (error) {
          console.error("Error fetching credit notes:", error);
          toast({ title: "Error", description: "No se pudieron cargar las notas de crédito.", variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchCreditNotes();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({...prev, [e.target.id]: e.target.value}));
  };

  const filteredCreditNotes = useMemo(() => {
      return creditNotes.filter(note => {
          const folioMatch = filters.folio ? note.id.toString().toLowerCase().includes(filters.folio.toLowerCase()) : true;
          const patientMatch = filters.patient ? note.patient.toLowerCase().includes(filters.patient.toLowerCase()) : true;
          const startDateMatch = filters.startDate ? new Date(note.date) >= new Date(filters.startDate) : true;
          const endDateMatch = filters.endDate ? new Date(note.date) <= new Date(filters.endDate) : true;
          const statusMatch = filters.status === 'all' ? true : note.status === filters.status;
          return folioMatch && patientMatch && startDateMatch && endDateMatch && statusMatch;
      });
  }, [creditNotes, filters]);

  const handleDelete = async (id: string) => {
      if (confirm('¿Está seguro que desea eliminar esta nota de crédito?')) {
          try {
              await deleteCreditNote(id);
              toast({title: "Éxito", description: "Nota de crédito eliminada."});
              fetchCreditNotes();
          } catch (error) {
              console.error("Error deleting credit note:", error);
              toast({title: "Error", description: "No se pudo eliminar la nota de crédito.", variant: "destructive"});
          }
      }
  };

  const handleEdit = (id: string) => {
      router.push(`/notas-de-credito/editar/${id}`);
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <NotebookTabs className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Notas de Crédito</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / Notas de Crédito
        </div>
      </div>
      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2"><Search /> Búsqueda de Notas de Crédito</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                    <Label htmlFor="folio">Buscar Folio de Nota de Crédito</Label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="folio" placeholder="Folio" className="pl-10" value={filters.folio} onChange={handleFilterChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="patient">Nombre del Paciente o Número de Solicitud</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="patient" placeholder="Paciente o Solicitud" className="pl-10" value={filters.patient} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="branch">Sucursal</Label>
                    <Select>
                        <SelectTrigger id="branch">
                            <SelectValue placeholder="Seleccionar Sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="main">Unidad Matriz</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha Inicial</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="startDate" type="date" className="pl-10" value={filters.startDate} onChange={handleFilterChange}/>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha Final</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="endDate" type="date" className="pl-10" value={filters.endDate} onChange={handleFilterChange}/>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 pt-6">
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Activas</SelectItem>
                            <SelectItem value="cancelled">Canceladas</SelectItem>
                            <SelectItem value="all">Todas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="flex justify-end mt-4">
                <Button><Search className="mr-2" /> Buscar</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <NotebookTabs /> Listado de Notas de Crédito
            </div>
            <Button asChild>
                <Link href="/notas-de-credito/crear">
                    <Plus className="mr-2" /> Crear Nota de Crédito
                </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Folio</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Importe</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow><TableCell colSpan={7} className="text-center">Cargando...</TableCell></TableRow>
                        ) : filteredCreditNotes.length > 0 ? (
                            filteredCreditNotes.map((note) => (
                                <TableRow key={note.id}>
                                    <TableCell>{String(note.id)}</TableCell>
                                    <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{note.patient}</TableCell>
                                    <TableCell>{note.reason}</TableCell>
                                    <TableCell>${Number(note.amount.toFixed(2))}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${note.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {note.status === 'active' ? 'Activa' : 'Cancelada'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(String(note.id))}>
                                            <FileEdit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(String(note.id))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                    No se encontraron registros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
