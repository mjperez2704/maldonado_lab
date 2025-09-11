
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CreditCard, Search, Calendar, FileText, User, DollarSign, HandCoins } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { getRecibos, Recibo } from "@/services/reciboService";
import { useToast } from "@/hooks/use-toast";

export default function AccountsReceivablePage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    folio: '',
    patient: '',
    startDate: '',
    endDate: '',
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [creditCardPlan, setCreditCardPlan] = useState('');
  const [commission, setCommission] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReceivables = async () => {
      try {
        const allRecibos = await getRecibos();
        const receivables = allRecibos.filter(r => r.due > 0);
        setRecibos(receivables);
      } catch (error) {
        console.error("Error fetching accounts receivable:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceivables();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({...prev, [id]: value}));
  }

  const filteredRecibos = useMemo(() => {
    return recibos.filter(recibo => {
        const folioMatch = filters.folio ? recibo.barcode.includes(filters.folio) : true;
        const patientMatch = filters.patient ? recibo.patientName.toLowerCase().includes(filters.patient.toLowerCase()) : true;
        const startDateMatch = filters.startDate ? new Date(recibo.date) >= new Date(filters.startDate) : true;
        const endDateMatch = filters.endDate ? new Date(recibo.date) <= new Date(filters.endDate) : true;
        return folioMatch && patientMatch && startDateMatch && endDateMatch;
    });
  }, [recibos, filters]);

  const openPaymentModal = (recibo: Recibo) => {
    setSelectedRecibo(recibo);
    setPaymentAmount(recibo.due); // Pre-fill with the due amount
    setPaymentMethod('');
    setCreditCardPlan('');
    setCommission(0);
    setIsPaymentModalOpen(true);
  }
  
  const handleProcessPayment = () => {
    if (!selectedRecibo || paymentAmount <= 0 || !paymentMethod) {
        toast({
            title: "Datos incompletos",
            description: "Por favor, complete el monto a pagar y el método de pago.",
            variant: "destructive"
        });
        return;
    }
    
    // Aquí iría la lógica para procesar el pago (llamada a un servicio, etc.)
    console.log({
        reciboId: selectedRecibo.id,
        amount: paymentAmount,
        method: paymentMethod,
        plan: creditCardPlan,
        commission
    });

    toast({
        title: "Pago Procesado (Simulación)",
        description: `Se registró un pago de $${paymentAmount.toFixed(2)} para el folio ${selectedRecibo.barcode}.`
    });

    setIsPaymentModalOpen(false);
    // Idealmente, se debería actualizar el registro en la base de datos y luego refrescar la lista.
  }

  return (
    <>
      <div className="flex flex-col gap-8 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Cuentas por Cobrar</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Cuentas por Cobrar
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Opciones de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="folio" placeholder="Folio" className="pl-10" value={filters.folio} onChange={handleFilterChange}/>
                      </div>
                       <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="patient" placeholder="Paciente" className="pl-10" value={filters.patient} onChange={handleFilterChange}/>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Fecha Solicitud" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="today">Hoy</SelectItem>
                              <SelectItem value="yesterday">Ayer</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Convenio" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="conv1">Convenio 1</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Doctor" /></SelectTrigger>
                          <SelectContent>
                               <SelectItem value="doc1">Dr. Juan</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select>
                          <SelectTrigger><SelectValue placeholder="Estado de Pago" /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="paid">Pagado</SelectItem>
                             <SelectItem value="unpaid">No Pagado</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div>
                      <Label>Seleccione Rango de Fechas:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="startDate" type="date" placeholder="Fecha Inicial" value={filters.startDate} onChange={handleFilterChange} className="pl-10"/>
                          </div>
                           <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="endDate" type="date" placeholder="Fecha Final" value={filters.endDate} onChange={handleFilterChange} className="pl-10"/>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="md:col-span-4 space-y-6 border-l md:pl-6">
                   <div>
                      <Label className="font-semibold">Opciones de Visualización</Label>
                      <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                              <Checkbox id="show-billed" defaultChecked />
                              <Label htmlFor="show-billed">Mostrar Solicitudes Facturadas</Label>
                          </div>
                          <div className="flex items-center gap-2">
                              <Checkbox id="show-unbilled" defaultChecked />
                              <Label htmlFor="show-unbilled">Mostrar Solicitudes Sin Facturar</Label>
                          </div>
                      </div>
                   </div>
                   <div>
                      <Label className="font-semibold">Selección Múltiple</Label>
                      <RadioGroup defaultValue="no" className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="multi-yes" />
                              <Label htmlFor="multi-yes">Sí</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="multi-no" />
                              <Label htmlFor="multi-no">No</Label>
                          </div>
                      </RadioGroup>
                   </div>
                   <Button className="w-full bg-green-600 hover:bg-green-700">Exportar a Excel</Button>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead>Paciente</TableHead>
                              <TableHead>Fecha Solicitud</TableHead>
                              <TableHead>Total Solicitud</TableHead>
                              <TableHead>Por Pagar</TableHead>
                              <TableHead className="text-center">Acción</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {loading ? (
                              <TableRow>
                                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                              </TableRow>
                          ) : filteredRecibos.length > 0 ? (
                             filteredRecibos.map((recibo, index) => (
                                 <TableRow key={recibo.id}>
                                     <TableCell>{index + 1}</TableCell>
                                     <TableCell>{recibo.barcode}</TableCell>
                                     <TableCell>{recibo.patientName}</TableCell>
                                     <TableCell>{new Date(recibo.date).toLocaleDateString()}</TableCell>
                                     <TableCell>${Number(recibo.total || 0).toFixed(2)}</TableCell>
                                     <TableCell className="font-bold text-red-600">${Number(recibo.due || 0).toFixed(2)}</TableCell>
                                     <TableCell className="text-center">
                                         <Button onClick={() => openPaymentModal(recibo)} size="sm">
                                            <HandCoins className="mr-2 h-4 w-4"/>
                                            Cobrar
                                         </Button>
                                     </TableCell>
                                 </TableRow>
                             ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                      No se encontraron cuentas por cobrar.
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Registrar Pago</DialogTitle>
            </DialogHeader>
            {selectedRecibo && (
                <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-md text-center">
                        <Label>Saldo Pendiente</Label>
                        <p className="text-2xl font-bold">${Number(selectedRecibo.due).toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Cantidad a Pagar</Label>
                        <div className="relative">
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input id="payment-amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-method">Método de Pago</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger id="payment-method">
                                <SelectValue placeholder="Seleccione un método"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                                <SelectItem value="TARJETA DE CRÉDITO">TARJETA DE CRÉDITO</SelectItem>
                                <SelectItem value="TARJETA DE DÉBITO">TARJETA DE DÉBITO</SelectItem>
                                <SelectItem value="TRANSFERENCIA BANCARÍA">TRANSFERENCIA BANCARÍA</SelectItem>
                                <SelectItem value="CHEQUE SBC">CHEQUE SBC</SelectItem>
                                <SelectItem value="TARJETA DE VALES">TARJETA DE VALES</SelectItem>
                                <SelectItem value="PAYPAL">PAYPAL</SelectItem>
                                <SelectItem value="MERCADO PAGO">MERCADO PAGO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {paymentMethod === 'TARJETA DE CRÉDITO' && (
                        <Card className="p-4 bg-primary/10">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cc-plan">Plan de Pagos</Label>
                                    <Select value={creditCardPlan} onValueChange={setCreditCardPlan}>
                                        <SelectTrigger id="cc-plan">
                                            <SelectValue placeholder="Seleccione plan de meses"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Pago único</SelectItem>
                                            <SelectItem value="3">3 Meses Sin Intereses</SelectItem>
                                            <SelectItem value="6">6 Meses Sin Intereses</SelectItem>
                                            <SelectItem value="9">9 Meses Sin Intereses</SelectItem>
                                            <SelectItem value="12">12 Meses Sin Intereses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {creditCardPlan !== '' && creditCardPlan !== 'none' && (
                                     <div className="space-y-2">
                                        <Label htmlFor="commission">Comisión (%)</Label>
                                        <Input id="commission" type="number" value={commission} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} placeholder="0"/>
                                     </div>
                                )}
                            </div>
                        </Card>
                    )}

                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleProcessPayment}>Confirmar Pago</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    