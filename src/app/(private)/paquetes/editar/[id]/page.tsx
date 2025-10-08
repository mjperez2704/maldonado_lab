
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Package as PackageIcon, X, Search } from "lucide-react";
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPackageById, updatePackage, Package } from "@/services/packageServicio";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";
import { getStudies, Estudio } from "@/services/studyServicio";
import { getCultures, Culture } from "@/services/cultureServicio";
import { Badge } from "@/components/ui/badge";

const packageSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  shortcut: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  tests: z.array(z.string()).optional(),
  cultures: z.array(z.string()).optional(),
  precautions: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const packageId = Number(params.id);
    const { toast } = useToast();
    const loader = useLoader();

    const [allStudies, setAllStudies] = useState<Estudio[]>([]);
    const [allCultures, setAllCultures] = useState<Culture[]>([]);
    const [studySearch, setEstudioSearch] = useState('');
    const [cultureSearch, setCultureSearch] = useState('');

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            tests: [],
            cultures: []
        }
    });

    useEffect(() => {
        if (packageId) {
            loader.start('read');
            Promise.all([
                getPackageById(packageId),
                getStudies(),
                getCultures()
            ]).then(([pkg, estudiosData, culturesData]) => {
                if (pkg) {
                    form.reset({
                        name: pkg.name,
                        shortcut: pkg.shortcut || '',
                        price: pkg.price,
                        tests: pkg.tests || [],
                        cultures: pkg.cultures || [],
                        precautions: pkg.precautions || '',
                    });
                } else {
                     toast({ title: "Error", description: "Paquete no encontrado.", variant: "destructive" });
                     router.push('/paquetes');
                }
                setAllStudies(estudiosData);
                setAllCultures(culturesData);
            }).catch(error => {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos del paquete.", variant: "destructive" });
            }).finally(() => loader.stop());
        }
    }, [packageId, router, form, toast, loader]);

    const selectedTests = form.watch('tests') || [];
    const selectedCultures = form.watch('cultures') || [];

    const filteredStudies = useMemo(() => 
        studySearch ? allStudies.filter(s => s.name.toLowerCase().includes(studySearch.toLowerCase()) && !selectedTests.includes(s.name)) : [],
    [studySearch, allStudies, selectedTests]);

    const filteredCultures = useMemo(() =>
        cultureSearch ? allCultures.filter(c => c.name.toLowerCase().includes(cultureSearch.toLowerCase()) && !selectedCultures.includes(c.name)) : [],
    [cultureSearch, allCultures, selectedCultures]);

    const addTest = (testName: string) => {
        form.setValue('tests', [...selectedTests, testName]);
        setEstudioSearch('');
    };

    const removeTest = (testName: string) => {
        form.setValue('tests', selectedTests.filter(t => t !== testName));
    };

    const addCulture = (cultureName: string) => {
        form.setValue('cultures', [...selectedCultures, cultureName]);
        setCultureSearch('');
    };

    const removeCulture = (cultureName: string) => {
        form.setValue('cultures', selectedCultures.filter(c => c !== cultureName));
    };

    const onSubmit = async (data: PackageFormValues) => {
        loader.start('update');
        try {
            const packageData: Omit<Package, 'id'> = {
                ...data,
                shortcut: data.shortcut || '',
                precautions: data.precautions || '',
                tests: data.tests || [],
                cultures: data.cultures || [],
            };
            await updatePackage(packageId, packageData);
            toast({
                title: "Éxito",
                description: "Paquete actualizado correctamente.",
            });
            router.push('/paquetes');
        } catch (error) {
            console.error("Error updating package:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el paquete.",
                variant: "destructive",
            });
        } finally {
            loader.stop();
        }
    };
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <PackageIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Paquetes</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/paquetes" className="hover:text-primary">Paquetes</Link> / Editar paquete
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar paquete</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre del paquete</FormLabel><FormControl><Input placeholder="Nombre del paquete" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="shortcut" render={({ field }) => (
                            <FormItem><FormLabel>Atajo</FormLabel><FormControl><Input placeholder="Atajo" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Precio</FormLabel>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">MXN</span>
                                    <FormControl><Input type="number" placeholder="Precio" className="rounded-l-none" {...field} disabled={loader.status !== 'idle'} onFocus={handleFocus} /></FormControl>
                                </div>
                            <FormMessage /></FormItem>
                        )}/>

                        <div className="md:col-span-3 space-y-2">
                            <FormLabel>Pruebas</FormLabel>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Buscar prueba para agregar..." 
                                    value={studySearch}
                                    onChange={(e) => setEstudioSearch(e.target.value)}
                                    className="pl-10"
                                />
                                {filteredStudies.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredStudies.map(study => (
                                            <div key={study.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => addTest(study.name)}>
                                                {study.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedTests.map(test => (
                                    <Badge key={test} variant="secondary" className="flex items-center gap-1">
                                        {test}
                                        <button type="button" onClick={() => removeTest(test)} className="rounded-full hover:bg-muted-foreground/20">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                         </div>
                        
                        <div className="md:col-span-3 space-y-2">
                            <FormLabel>Cultivos</FormLabel>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Buscar cultivo para agregar..." 
                                    value={cultureSearch}
                                    onChange={(e) => setCultureSearch(e.target.value)}
                                    className="pl-10"
                                />
                                {filteredCultures.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredCultures.map(culture => (
                                            <div key={culture.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => addCulture(culture.name)}>
                                                {culture.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedCultures.map(culture => (
                                    <Badge key={culture} variant="secondary" className="flex items-center gap-1">
                                        {culture}
                                        <button type="button" onClick={() => removeCulture(culture)} className="rounded-full hover:bg-muted-foreground/20">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                    </div>

                    <FormField control={form.control} name="precautions" render={({ field }) => (
                        <FormItem><FormLabel>Precauciones</FormLabel><FormControl><Textarea placeholder="Precauciones" {...field} disabled={loader.status !== 'idle'} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <div className="flex justify-start">
                        <Button type="submit" disabled={loader.status !== 'idle'}>
                            <Check className="mr-2"/> {loader.status === 'update' ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
