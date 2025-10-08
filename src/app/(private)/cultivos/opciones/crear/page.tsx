
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, ClipboardList, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCultureOption } from "@/services/cultivosOpcionesServicio";
import Link from "next/link";

export default function CreateCultureOptionPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState(['']);

    const handleAddOption = () => {
        setOptions([...options, '']);
    }
    
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    }

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCultureOption({
                title,
                options: options.filter(opt => opt.trim() !== '')
            });
            router.push('/cultivos/opciones');
        } catch (error) {
            console.error("Error creating culture option: ", error);
        }
    };

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Opciones de cultivo</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/cultivos/opciones" className="hover:text-primary">Opciones de cultivo</Link> / Crear opción de cultivo
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear opción de cultivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
           <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="space-y-2">
                <Label htmlFor="nombre">Título</Label>
                <Input id="nombre" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-4">
                <Label>Opciones</Label>
                <div className="flex flex-col gap-4">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input 
                                placeholder="Opción" 
                                value={option} 
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                            />
                            {options.length > 1 && (
                                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveOption(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            {index === options.length - 1 && (
                                <Button type="button" size="icon" className="bg-primary hover:bg-primary/90 rounded-full flex-shrink-0" onClick={handleAddOption}>
                                    <Plus className="text-primary-foreground"/>
                                </Button>
                            )}
                        </div>
                    ))}
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
