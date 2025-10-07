
"use client";

import React, { useEffect, useState } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from 'next/image';
import {
  Plus,
  Copy,
  FileSpreadsheet,
  FileText,
  FileDown,
  ChevronDown,
  Eye,
  Search,
  Settings,
  Pencil,
  Trash2,
  ArrowUpDown,
  FileText as FileTextIcon,
  Filter,
  Printer,
  EyeIcon,
  Mail,
  LogIn,
  XCircle,
  CheckCircle2
} from "lucide-react"
import { getRecibos, Recibo } from '@/services/reciboService';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecibos = async () => {
        try {
            const data = await getRecibos();
            setRecibos(data);
        } catch (error) {
            console.error("Error fetching receipts: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchRecibos();
  }, []);

  const handleShowReceipt = (recibo: Recibo) => {
    setSelectedRecibo(recibo);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div>Cargando facturas...</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
              <FileTextIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Facturas</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Facturas
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
            <CardTitle>Tabla de facturas</CardTitle>
            <Button asChild variant="secondary">
              <Link href="#">
                  <Plus className="mr-2 h-4 w-4" /> Crear
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-primary/10 rounded-lg">
                  <Button variant="outline" className="bg-primary text-white">
                      <Filter className="mr-2 h-4 w-4" /> Filtros
                  </Button>
                  <div className="flex items-center gap-2">
                      <Button variant="outline"><Copy className="mr-2 h-4 w-4" />Copiar</Button>
                      <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
                      <Button variant="outline"><FileText className="mr-2 h-4 w-4" />CSV</Button>
                      <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
                      <Button variant="outline" size="icon"><Eye /></Button>
                  </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Mostrar 10 <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>10</DropdownMenuItem>
                      <DropdownMenuItem>25</DropdownMenuItem>
                      <DropdownMenuItem>50</DropdownMenuItem>
                      <DropdownMenuItem>100</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-muted-foreground">registros</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" /> Acción masiva <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Eliminar seleccionados</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-10" />
                </div>
              </div>
              <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead className="w-[40px]">
                          <Checkbox />
                          </TableHead>
                          <TableHead>
                              <Button variant="ghost" size="sm"># <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                          </TableHead>
                          <TableHead>Creado por</TableHead>
                          <TableHead>Código de barras</TableHead>
                          <TableHead>Código del paciente</TableHead>
                          <TableHead>Nombre del paciente</TableHead>
                          <TableHead>Contrato</TableHead>
                          <TableHead>Total parcial</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Pagado</TableHead>
                          <TableHead>Debido</TableHead>
                          <TableHead>
                              <Button variant="ghost" size="sm">Fecha <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                          </TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {recibos.map((item, index) => (
                          <TableRow key={item.id}>
                          <TableCell>
                              <Checkbox />
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.createdBy}</TableCell>
                          <TableCell>{item.barcode}</TableCell>
                          <TableCell>{item.patientCode}</TableCell>
                          <TableCell>{item.patientName}</TableCell>
                          <TableCell>{item.contract}</TableCell>
                          <TableCell>{item.subtotal}</TableCell>
                          <TableCell>{item.descuento}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>{item.pagado}</TableCell>
                          <TableCell>{item.adeudo}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                              {item.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                              )}
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center justify-end">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="bg-primary text-white hover:bg-primary/90">
                                              <Settings className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Imprimir código de barras</DropdownMenuItem>
                                          <DropdownMenuItem><FileTextIcon className="mr-2 h-4 w-4" /> Hoja de trabajo</DropdownMenuItem>
                                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Imprimir el recibo</DropdownMenuItem>
                                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Imprimir Ticket de Venta</DropdownMenuItem>
                                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Imprimir Ticket de Anticipo</DropdownMenuItem>
                                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Imprimir Ticket de Recepción de Muestras</DropdownMenuItem>
                                          <DropdownMenuItem onSelect={() => handleShowReceipt(item)}><EyeIcon className="mr-2 h-4 w-4" /> Mostrar recibo</DropdownMenuItem>
                                          <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Enviar recibo</DropdownMenuItem>
                                          <DropdownMenuItem><LogIn className="mr-2 h-4 w-4" /> Ingresar informe</DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Borrar</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </div>
                          </TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa del Ticket</DialogTitle>
          </DialogHeader>
          {selectedRecibo && (
            <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-sm font-mono">
              <div className="text-center space-y-2 mb-4">
                <Image src="https://placehold.co/64x64.png" alt="Logo" width={64} height={64} className="mx-auto" data-ai-hint="logo"/>
                <h2 className="font-bold text-lg">Laboratorios Maldonado</h2>
                <p className="text-xs">Av. Siempre Viva 123, Springfield</p>
                <p className="text-xs">Tel: (555) 123-4567</p>
                <p className="text-xs">{new Date(selectedRecibo.date).toLocaleString()}</p>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-2">
                <p><strong>Paciente:</strong> {selectedRecibo.patientName}</p>
                <p><strong>Código:</strong> {selectedRecibo.patientCode}</p>
              </div>
              <div className="border-t border-dashed border-gray-400 my-2">
                 <div className="flex justify-between font-bold">
                    <span>Descripción</span>
                    <span>Total</span>
                 </div>
                 {/* Placeholder for items */}
                 <div className="flex justify-between">
                    <span>Consulta General</span>
                    <span>${Number(selectedRecibo.total.toFixed(2))}</span>
                 </div>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(selectedRecibo.subtotal.toFixed(2))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>${Number(selectedRecibo.descuento.toFixed(2))}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>${Number(selectedRecibo.total.toFixed(2))}</span>
                </div>
                 <div className="flex justify-between">
                  <span>Pagado:</span>
                  <span>${Number(selectedRecibo.pagado.toFixed(2))}</span>
                </div>
                 <div className="flex justify-between">
                  <span>Debido:</span>
                  <span>${Number(selectedRecibo.adeudo.toFixed(2))}</span>
                </div>
              </div>
               <div className="text-center mt-4">
                  <p className="font-bold">¡Gracias por su visita!</p>
               </div>
               <div className="flex justify-center mt-4">
                    <Image src="https://placehold.co/100x100.png" alt="QR Code" width={100} height={100} data-ai-hint="qr code"/>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
