
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Search, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import { getStudies, Study } from '@/services/studyService';
import { getCategories, Category } from '@/services/categoryService';
import Link from "next/link";

export default function PriceListPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('shortcut');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studiesData, categoriesData] = await Promise.all([
            getStudies(),
            getCategories(),
        ]);
        setStudies(studiesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data for price list: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedStudies = useMemo(() => {
    let filtered = studies;

    if (searchTerm) {
        filtered = filtered.filter(study => 
            study.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            study.shortcut.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(study => study.category === selectedCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
        if (sortOrder === 'shortcut') {
            return a.shortcut.localeCompare(b.shortcut);
        }
        if (sortOrder === 'alpha') {
            return a.name.localeCompare(b.name);
        }
        if (sortOrder === 'area') {
            const categoryCompare = a.category.localeCompare(b.category);
            if (categoryCompare !== 0) return categoryCompare;
            return a.name.localeCompare(b.name);
        }
        return 0;
    });
    
    return sorted;
  }, [studies, searchTerm, sortOrder, selectedCategory]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
       <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Lista de Precios</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / Lista de Precios
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Búsqueda y Ordenamiento</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar estudio" 
                            className="pl-8" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSortOrder('shortcut'); }}>Mostrar todos</Button>
                    <div className="space-y-2">
                        <Label>Ordenar Estudios Por:</Label>
                        <RadioGroup value={sortOrder} onValueChange={setSortOrder}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="shortcut" id="shortcut" />
                                <Label htmlFor="shortcut">Código</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="alpha" id="alpha" />
                                <Label htmlFor="alpha">Alfabéticamente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="area" id="area" />
                                <Label htmlFor="area">Área</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Filtrar por Área:</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Listas de Precios Activas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="general" defaultChecked />
                            <Label htmlFor="general">Lista General</Label>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="empresa-a" defaultChecked />
                            <Label htmlFor="empresa-a">Convenio Empresa A</Label>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                        <Input placeholder="Nombre de Nueva Lista" />
                        <Button variant="outline" className="w-full">Crear Nueva Lista</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Operaciones Masivas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <div className="space-y-2">
                        <Input type="number" placeholder="Aumento/Disminución (%)" onFocus={handleFocus} />
                        <Button variant="outline" className="w-full">Aplicar a Lista Seleccionada</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Tabla de Precios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Atajo</TableHead>
                                    <TableHead>Estudio</TableHead>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Lista General</TableHead>
                                    <TableHead>Convenio Empresa A</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">Cargando estudios...</TableCell>
                                    </TableRow>
                                ) : filteredAndSortedStudies.map((study) => (
                                    <TableRow key={study.id}>
                                        <TableCell>{study.shortcut}</TableCell>
                                        <TableCell>{study.name}</TableCell>
                                        <TableCell>{study.category}</TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={Number(study.price.toFixed(2))} className="w-24" onFocus={handleFocus} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={Number((study.price * 0.9).toFixed(2))} className="w-24" onFocus={handleFocus} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
