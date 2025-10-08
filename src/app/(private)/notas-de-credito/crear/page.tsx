
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NotebookTabs, User, Calendar, DollarSign, Building, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCreditNote } from "@/services/creditNoteServicio";
import { useToast } from "@/hooks/use-toast";
import { getPatients, Patient } from "@/services/patientServicio";


export default function CreateCreditNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    branch: 'main',
    date: new Date().toISOString().split('T')[0],
    patient: '',
    amount: 0,
    reason: '',
  });

  useEffect(() => {
    const fetchPatients = async () => {
        try {
            const patientsData = await getPatients();
            setPatients(patientsData);
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los pacientes.",
                variant: "destructive",
            });
        }
    };
    fetchPatients();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [id]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (id: 'branch' | 'patient', value: string) => {
      setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || formData.amount <= 0 || !formData.reason) {
        toast({
            title: "Campos Incompletos",
            description: "Por favor, rellene todos los campos requeridos.",
            variant: "destructive"
        });
        return;
    }
    try {
        await createCreditNote(formData);
        toast({
            title: "Éxito",
            description: "Nota de crédito creada correctamente."
        });
        router.push('/notas-de-credito');
    } catch (error) {
        console.error("Error creating credit note:", error);
        toast({
            title: "Error",
            description: "No se pudo crear la nota de crédito.",
            variant: "destructive"
        });
    }
  };
  
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <NotebookTabs className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Notas de Crédito</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/notas-de-credito" className="hover:text-primary">Notas de Crédito</Link> / Crear
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Nota de Crédito</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="branch">Sucursal</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Select value={formData.branch} onValueChange={(value) => handleSelectChange('branch', value)}>
                                <SelectTrigger id="branch" className="pl-10">
                                    <SelectValue placeholder="Seleccionar Sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="main">Unidad Matriz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="date" type="date" className="pl-10" value={formData.date} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient">Paciente</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Select value={formData.patient} onValueChange={(value) => handleSelectChange('patient', value)}>
                                <SelectTrigger id="patient" className="pl-10">
                                    <SelectValue placeholder="Seleccionar Paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amount">Importe</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="amount" type="number" placeholder="0.00" className="pl-10" value={formData.amount} onChange={handleChange} onFocus={handleFocus} />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea id="reason" placeholder="Escriba el motivo de la nota de crédito..." value={formData.reason} onChange={handleChange}/>
                    </div>
                </div>
                
                <div className="flex justify-end mt-6">
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4"/> Guardar Nota de Crédito
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
