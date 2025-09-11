"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  FlaskConical,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  User,
  Hash,
  Eye,
} from "lucide-react"
import { getRecibos, Recibo } from '@/services/reciboService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function TestRequestsPage() {
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '', startDate: '', endDate: '', status: 'all' });
    const router = useRouter();
    const { toast } = useToast();

    const fetchRecibos = async () => {
        try {
            const data = await getRecibos();
            setRecibos(data);
        } catch (error) {
            console.error("Error fetching requests: ", error);
            toast({ title: "Error", description: "No se pudieron cargar las solicitudes." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecibos();
    }, []);

    const filteredRecibos = useMemo(() => {
        return recibos.filter(recibo => {
            const folioMatch = filters.folio ? recibo.barcode.toLowerCase().includes(filters.folio.toLowerCase()) : true;
            const patientMatch = filters.patient ? recibo.patientName.toLowerCase().includes(filters.patient.toLowerCase()) : true;
            const startDateMatch = filters.startDate ? new Date(recibo.date) >= new Date(filters.startDate) : true;
            const endDateMatch = filters.endDate ? new Date(recibo.date) <= new Date(filters.endDate) : true;
            const statusMatch = filters.status === 'all' ? true : recibo.status === filters.status;
            return folioMatch && patientMatch && startDateMatch && endDateMatch && statusMatch;
        });
    }, [recibos, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    
    const handleStatusChange = (value: string) => {
        setFilters(prev => ({...prev, status: value}));
    }

  return (
    <div className="flex flex-col gap-8 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <FlaskConical className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Solicitud de Exámenes</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Hogar</Link> / Solicitud de Exámenes
            </div>
        </div>
      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Filter /> Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
                <label htmlFor="folio">Folio</label>
              <div className="relative">
                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="folio" placeholder="Folio de la solicitud" className="pl-10" value={filters.folio} onChange={handleFilterChange} />
              </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="patient">Paciente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="patient" placeholder="Nombre del Paciente" className="pl-10" value={filters.patient} onChange={handleFilterChange} />
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="startDate">Fecha Inicial</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="startDate" type="date" className="pl-10" value={filters.startDate} onChange={handleFilterChange} />
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="endDate">Fecha Final</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="endDate" type="date" className="pl-10" value={filters.endDate} onChange={handleFilterChange} />
                </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="status">Estado</label>
                 <Select value={filters.status} onValueChange={handleStatusChange}>
                     <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">Todos</SelectItem>
                         <SelectItem value="pending">Pendiente</SelectItem>
                         <SelectItem value="completed">Completado</SelectItem>
                         <SelectItem value="cancelled">Cancelado</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical /> Listado de Solicitudes
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/solicitud-examenes/crear">
                        <Plus className="mr-2"/> Nueva Solicitud
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
                    ) : filteredRecibos.length > 0 ? (
                        filteredRecibos.map(recibo => (
                            <TableRow key={recibo.id}>
                                <TableCell>{recibo.barcode}</TableCell>
                                <TableCell>{new Date(recibo.date).toLocaleDateString()}</TableCell>
                                <TableCell>{recibo.patientName}</TableCell>
                                <TableCell>${Number(recibo.total.toFixed(2))}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                        recibo.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                                        recibo.status === 'completed' ? 'bg-green-200 text-green-800' :
                                        'bg-red-200 text-red-800'
                                    }`}>
                                        {recibo.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <Button variant="outline" size="icon" title="Ver Solicitud">
                                        <Eye className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="outline" size="icon" title="Editar Solicitud" disabled={recibo.status !== 'pending'}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="destructive" size="icon" title="Eliminar Solicitud" disabled={recibo.status !== 'pending'}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No se encontraron solicitudes.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
