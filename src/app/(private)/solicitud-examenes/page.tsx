
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
import { getRecibos, Recibo, deleteRecibo } from '@/services/reciboServicio';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { SalesTicket } from './crear/SalesTicket';


export default function TestRequestsPage() {
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ folio: '', patient: '', startDate: '', endDate: '', status: 'all' });
    const router = useRouter();
    const { toast } = useToast();
    const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const patientMatch = filters.patient ? recibo.nombrePaciente.toLowerCase().includes(filters.patient.toLowerCase()) : true;
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

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
            try {
                await deleteRecibo(id);
                toast({ title: 'Éxito', description: 'Solicitud eliminada correctamente.' });
                fetchRecibos(); // Recargar la lista
            } catch (error) {
                console.error("Error deleting request:", error);
                toast({ title: "Error", description: "No se pudo eliminar la solicitud.", variant: "destructive" });
            }
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/solicitud-examenes/editar/${id}`);
    };

    const handleShow = (recibo: Recibo) => {
        setSelectedRecibo(recibo);
        setIsModalOpen(true);
    };

    const handlePrintFromModal = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Ticket de Venta</title>');
            printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } @page { size: 80mm auto; margin: 0; } } body { font-family: monospace; font-size: 10px; margin: 0; padding: 5px; width: 78mm; }</style>');
            printWindow.document.write('</head><body>');
            const ticketElement = document.getElementById('ticket-preview-content');
            if (ticketElement) {
                printWindow.document.write(ticketElement.innerHTML);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
        setIsModalOpen(false);
    };


  return (
    <>
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
                                    <TableCell>{recibo.nombrePaciente}</TableCell>
                                    <TableCell>${Number(recibo.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs capitalize font-semibold ${
                                            recibo.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                                            recibo.status === 'completed' ? 'bg-green-200 text-green-800' :
                                            'bg-red-200 text-red-800'
                                        }`}>
                                            {recibo.status === 'pending' ? 'Pendiente' : recibo.status === 'completed' ? 'Completado' : 'Cancelado'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right flex gap-2 justify-end">
                                        <Button variant="outline" size="icon" title="Ver Solicitud" onClick={() => handleShow(recibo)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="outline" size="icon" title="Editar Solicitud" onClick={() => handleEdit(recibo.id)} disabled={recibo.status !== 'pending'}>
                                            <Pencil className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="destructive" size="icon" title="Eliminar Solicitud" onClick={() => handleDelete(recibo.id)} disabled={recibo.status !== 'pending'}>
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
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-xs">
                 <DialogHeader>
                    <DialogTitle>Ticket de Venta</DialogTitle>
                </DialogHeader>
                {selectedRecibo && (
                    <div id="ticket-preview-content">
                        <SalesTicket recibo={selectedRecibo} items={[...selectedRecibo.estudios.map(s => ({name: s, price: 0, type: 'study' as const})), ...selectedRecibo.paquetes.map(p => ({name: p, price: 0, type: 'package' as const}))]}/>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cerrar</Button>
                    </DialogClose>
                     <Button type="button" onClick={handlePrintFromModal}>Imprimir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
