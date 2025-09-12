
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BadgePercent, Calendar, Check, DollarSign } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, Expense } from "@/services/expenseService";
import Link from "next/link";

export default function CreateExpensePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
        date: '',
        category: '',
        amount: 0,
        paymentMethod: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, paymentMethod: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExpense(formData);
            router.push('/gastos');
        } catch (error) {
            console.error("Error creating expense:", error);
        }
    };
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BadgePercent className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Gastos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/gastos" className="hover:text-primary">Gastos</Link> / Crear Gasto
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Gasto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <div className="relative">
                            <Input id="date" type="date" value={formData.date} onChange={handleChange} />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" placeholder="Ej: Salarios, Renta" value={formData.category} onChange={handleChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Cantidad</Label>
                        <div className="relative">
                            <Input id="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} onFocus={handleFocus} />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-method">Método de pago</Label>
                        <Select onValueChange={handleSelectChange} value={formData.paymentMethod}>
                            <SelectTrigger id="payment-method">
                                <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="md:col-span-2 lg:col-span-3 space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea id="notes" placeholder="Notas adicionales sobre el gasto" value={formData.notes} onChange={handleChange}/>
                    </div>
                </div>
                
                <div className="flex justify-start">
                    <Button type="submit">
                        <Check className="mr-2"/> Guardar Gasto
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
