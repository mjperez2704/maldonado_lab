
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, TestTube, Trash2 } from "lucide-react";
import { useState } from "react";
import { createCulture, Culture } from "@/services/cultivosServicio";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function CreateCulturePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        categoria: '',
        nombre: '',
        tipo_muestra_id: '',
        price: 0,
        precautions: '',
        comments: [''],
        consumptions: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}));
    };

    const addComment = () => {
        setFormData(prev => ({ ...prev, comments: [...prev.comments, ''] }));
    };

    const removeComment = (index: number) => {
        const newComments = formData.comments.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, comments: newComments }));
    };

    const handleCommentChange = (index: number, value: string) => {
        const newComments = [...formData.comments];
        newComments[index] = value;
        setFormData(prev => ({ ...prev, comments: newComments }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCulture(formData as Omit<Culture, 'id'>);
            router.push('/cultivos');
        } catch (error) {
            console.error("Error creating culture: ", error);
        }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Cultivos</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/cultivos" className="hover:text-primary">Cultivos</Link> / Crear cultivo
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear cultivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select onValueChange={(value) => handleSelectChange('categoria', value)} value={formData.categoria}>
                            <SelectTrigger id="categoria">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Microbiología">Microbiología</SelectItem>
                                <SelectItem value="Biología Molecular">Biología Molecular</SelectItem>
                                <SelectItem value="Inmunología">Inmunología</SelectItem>
                                <SelectItem value="Hematología">Hematología</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" value={formData.nombre} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo_muestra_id">Tipo de ejemplo</Label>
                        <Input id="tipo_muestra_id" value={formData.tipo_muestra_id} onChange={handleChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <div className="flex items-center">
                            <Input id="price" type="number" className="rounded-r-none" value={formData.price} onChange={handlePriceChange} onFocus={handleFocus} />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted text-muted-foreground">
                                MXN
                            </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="precautions">Precauciones</Label>
                    <Textarea id="precautions" placeholder="Precauciones" value={formData.precautions} onChange={handleChange} />
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <h3 className="font-semibold">Comentarios de resultados</h3>
                        <Button size="icon" type="button" onClick={addComment}>
                            <Plus />
                        </Button>
                    </div>
                    {formData.comments.map((comment, index) => (
                         <div key={index} className="flex items-center gap-2">
                             <Input placeholder="Comentario" value={comment} onChange={(e) => handleCommentChange(index, e.target.value)} />
                             {formData.comments.length > 1 && (
                                <Button variant="destructive" size="icon" type="button" onClick={() => removeComment(index)}>
                                    <Trash2 />
                                </Button>
                             )}
                         </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <h3 className="font-semibold">Consumos</h3>
                        <Button size="icon" type="button">
                            <Plus />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {/* Las filas de los consumos se añadirían aquí dinámicamente */}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex justify-start">
                    <Button type="submit">
                        <Check className="mr-2"/> Guardar
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
