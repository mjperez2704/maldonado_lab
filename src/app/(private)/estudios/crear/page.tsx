
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Microscope, Info, Plus, Trash2, Save, Check, HelpCircle, ArrowDown, ArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createStudy, Study, StudyParameter, IntegratedStudyRef, StudySample } from "@/services/studyService";
import { getCategories, Category } from "@/services/categoryService";
import { getProviders, Provider } from "@/services/providerService";
import { getStudies as getAllStudies } from "@/services/studyService";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const initialFormData: Omit<Study, 'id'> = {
    area: '',
    code: '',
    name: '',
    method: '',
    internalCost: 0,
    deliveryTime: 0,
    deliveryUnit: 'dias',
    processTime: '',
    processDays: '',
    isOutsourced: false,
    outsourcedLabId: '',
    outsourcedCode: '',
    outsourcedCost: 0,
    outsourcedDeliveryTime: '',
    legend: '',
    scientificDescription: '',
    satServiceKey: '',
    satUnitKey: '',
    parameters: [],
    config: {
        showInRequest: false,
        canUploadDocuments: false,
        printLabSignature: false,
        printWebSignature: false,
        hasEnglishHeaders: false,
        printWithParams: false,
        generateWorkOrder: false,
    },
    hasSubStudies: false,
    isPackage: false,
    integratedStudies: [],
    synonyms: [''],
    samples: [],
    // deprecated/simplified fields
    price: 0,
    sampleType: '',
    category: '',
    shortcut: '',
};

export default function CreateStudyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Study, 'id'>>(initialFormData);
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [allStudies, setAllStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState(false);

    const [newParam, setNewParam] = useState<StudyParameter>({ name: '', unit: '', cost: 0, factor: '', referenceType: '' });
    const [newSample, setNewSample] = useState<StudySample>({ type: '', container: '', indications: '', cost: 0 });
    const [studySearchTerm, setStudySearchTerm] = useState('');
    const [selectedIntegratedStudy, setSelectedIntegratedStudy] = useState<string | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, provs, studies] = await Promise.all([getCategories(), getProviders(), getAllStudies()]);
                setCategories(cats);
                setProviders(provs);
                setAllStudies(studies);
            } catch (error) {
                console.error("Error fetching dependencies", error);
                toast({ title: "Error", description: "No se pudieron cargar las áreas y laboratorios.", variant: "destructive" });
            }
        };
        fetchData();
    }, [toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSelectChange = (id: keyof Omit<Study, 'id'>, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleConfigChange = (id: keyof Study['config'], value: boolean) => {
        setFormData(prev => ({ ...prev, config: { ...prev.config, [id]: value } }));
    };

    // --- Parameters Logic ---
    const handleAddParameter = () => {
        if (!newParam.name) {
            toast({ title: "Error", description: "El nombre del parámetro no puede estar vacío.", variant: "destructive" });
            return;
        }
        setFormData(prev => ({...prev, parameters: [...(prev.parameters || []), newParam]}));
        setNewParam({ name: '', unit: '', cost: 0, factor: '', referenceType: '' }); // Reset
    };

    const handleRemoveParameter = (index: number) => {
        setFormData(prev => ({
            ...prev,
            parameters: (prev.parameters || []).filter((_, i) => i !== index)
        }));
    };

    // --- Integrated Studies Logic ---
    const filteredStudies = allStudies.filter(study =>
        (study.name.toLowerCase().includes(studySearchTerm.toLowerCase()) ||
         (study.code || '').toLowerCase().includes(studySearchTerm.toLowerCase())) &&
        !formData.integratedStudies?.some(is => is.id === study.id)
    ).slice(0, 10);

    const addIntegratedStudy = (study: Study) => {
        const newIntegratedStudy: IntegratedStudyRef = { id: study.id, name: study.name };
        setFormData(prev => ({
            ...prev,
            integratedStudies: [...(prev.integratedStudies || []), newIntegratedStudy]
        }));
        setStudySearchTerm('');
    };

    const removeIntegratedStudy = () => {
        if (!selectedIntegratedStudy) return;
        setFormData(prev => ({
            ...prev,
            integratedStudies: (prev.integratedStudies || []).filter(s => s.id !== Number(selectedIntegratedStudy))
        }));
        setSelectedIntegratedStudy(null);
    };

    // --- Synonyms Logic ---
    const handleSynonymChange = (index: number, value: string) => {
        const newSynonyms = [...(formData.synonyms || [])];
        newSynonyms[index] = value;
        setFormData(prev => ({ ...prev, synonyms: newSynonyms }));
    };

    const addSynonym = () => {
        setFormData(prev => ({ ...prev, synonyms: [...(prev.synonyms || []), ''] }));
    };

    const removeSynonym = (index: number) => {
        setFormData(prev => ({ ...prev, synonyms: (prev.synonyms || []).filter((_, i) => i !== index) }));
    };

    // --- Samples Logic ---
    const handleAddSample = () => {
        if (!newSample.type) {
            toast({ title: "Error", description: "El tipo de muestra no puede estar vacío.", variant: "destructive" });
            return;
        }
        setFormData(prev => ({...prev, samples: [...(prev.samples || []), newSample]}));
        setNewSample({ type: '', container: '', indications: '', cost: 0 }); // Reset
    };

    const handleRemoveSample = (index: number) => {
        setFormData(prev => ({ ...prev, samples: (prev.samples || []).filter((_, i) => i !== index) }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.area) {
            toast({ title: "Campos requeridos", description: "Por favor, complete los campos Nombre y Área.", variant: "destructive"});
            return;
        }
        setLoading(true);
        try {
            const finalData = {
                ...formData,
                synonyms: formData.synonyms?.filter(s => s.trim() !== '')
            };
            await createStudy(finalData);
            toast({ title: "Éxito", description: "Estudio creado correctamente." });
            setFormData(initialFormData); // Limpiar formulario
            router.push('/estudios');
        } catch (error) {
            console.error("Error creating study:", error);
            toast({ title: "Error", description: "No se pudo crear el estudio.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const renderConfigRadio = (id: keyof Study['config'], label: string) => (
        <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
                <Label htmlFor={id} className="text-sm">{label}</Label>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <RadioGroup id={id} value={formData.config[id] ? "yes" : "no"} onValueChange={(value) => handleConfigChange(id, value === 'yes')} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${id}-yes`} /><Label htmlFor={`${id}-yes`}>Si</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${id}-no`} /><Label htmlFor={`${id}-no`}>No</Label></div>
            </RadioGroup>
        </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-8">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-primary">Estudios</h1>
            <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/estudios" className="hover:text-primary">Estudios</Link> / Crear Estudio
            </div>
        </div>

      <Tabs defaultValue="datos" className="w-full">
        <TabsList>
            <TabsTrigger value="datos">Datos del Estudio</TabsTrigger>
            <TabsTrigger value="integran">Estudios que lo integran</TabsTrigger>
            <TabsTrigger value="sinonimos">Sinónimos del Estudio</TabsTrigger>
            <TabsTrigger value="muestras">Muestras del Estudio</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="pt-4 space-y-6">
            <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Configuración del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {renderConfigRadio('showInRequest', '¿Aparecerá el estudio en el módulo de Solicitud de Exámenes?')}
                    {renderConfigRadio('canUploadDocuments', '¿Se podrán cargar imágenes, documentos, etc al reportar el estudio?')}
                    {renderConfigRadio('printLabSignature', '¿El estudio se imprimirá con firma digitalizada en el Reporte de Entrega al paciente en el LABORATORIO?')}
                    {renderConfigRadio('printWebSignature', '¿El estudio se imprimirá con firma digitalizada en el Reporte de Entrega al paciente en el PORTAL WEB?')}
                    {renderConfigRadio('hasEnglishHeaders', '¿El estudio tendrá encabezado y leyendas internas en Inglés?')}
                    {renderConfigRadio('printWithParams', '¿El estudio saldrá impreso con sus parámetros en la Orden de Trabajo?')}
                    {renderConfigRadio('generateWorkOrder', '¿Desea que se genere la Orden de Trabajo para este estudio?')}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Datos Generales del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="area">Área*</Label><Select value={formData.area} onValueChange={(v) => handleSelectChange('area', v)} required><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="code">Código</Label><Input id="code" value={formData.code} onChange={handleChange}/></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="name">Nombre*</Label><Input id="name" value={formData.name} onChange={handleChange} required/></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="method">Método</Label><Input id="method" value={formData.method} onChange={handleChange}/></div>
                    <div className="space-y-2"><Label htmlFor="internalCost">Costo interno p/prueba</Label><Input id="internalCost" type="number" value={formData.internalCost} onChange={handleChange}/></div>
                    <div className="space-y-2"><Label>Tiempo de entrega</Label><div className="flex gap-2"><Input id="deliveryTime" type="number" className="w-1/2" value={formData.deliveryTime} onChange={handleChange}/><Select value={formData.deliveryUnit} onValueChange={(v) => handleSelectChange('deliveryUnit', v as 'dias' | 'horas')}><SelectTrigger className="w-1/2"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="horas">Horas</SelectItem><SelectItem value="dias">Días</SelectItem></SelectContent></Select></div></div>
                    <div className="space-y-2"><Label htmlFor="processTime">Tiempo de Proceso</Label><Select value={formData.processTime} onValueChange={(v) => handleSelectChange('processTime', v)}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent><SelectItem value="mismo_dia">Mismo día</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="processDays">Días de Proceso</Label><Input id="processDays" value={formData.processDays} onChange={handleChange}/></div>

                    <div className="space-y-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 items-center border-t pt-4">
                        <div className="lg:col-span-1"><Label>¿Este es un estudio subrogado?</Label><RadioGroup value={formData.isOutsourced ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('isOutsourced', v === 'yes')} className="flex gap-4 mt-2"><RadioGroupItem value="yes" id="sub-yes"/><Label htmlFor="sub-yes">Si</Label><RadioGroupItem value="no" id="sub-no"/><Label htmlFor="sub-no">No</Label></RadioGroup></div>
                        <div className="space-y-2 lg:col-span-2"><Label htmlFor="outsourcedLabId">Lab. de Referencia</Label><Select value={formData.outsourcedLabId} onValueChange={(v) => handleSelectChange('outsourcedLabId', v)} disabled={!formData.isOutsourced}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{providers.map(p=><SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="outsourcedCode">Código</Label><Input id="outsourcedCode" value={formData.outsourcedCode} onChange={handleChange} disabled={!formData.isOutsourced}/></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="outsourcedCost">Costo</Label><Input id="outsourcedCost" type="number" value={formData.outsourcedCost} onChange={handleChange} disabled={!formData.isOutsourced}/></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="outsourcedDeliveryTime">Tiempo de entrega</Label><Select value={formData.outsourcedDeliveryTime} onValueChange={(v) => handleSelectChange('outsourcedDeliveryTime', v)} disabled={!formData.isOutsourced}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent><SelectItem value="3_dias">3 días</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="lg:col-span-4 space-y-2"><Label htmlFor="legend">Leyenda/Observaciones del estudio</Label><Textarea id="legend" value={formData.legend} onChange={handleChange}/></div>
                    <div className="lg:col-span-4 space-y-2"><Label htmlFor="scientificDescription">Descripción científica sobre la aplicación y funcionamiento del estudio</Label><Textarea id="scientificDescription" value={formData.scientificDescription} onChange={handleChange}/></div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Datos de Facturación para el estudio (Aplicable solo para México)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="satServiceKey">Clave del Servicio</Label><Select value={formData.satServiceKey} onValueChange={(v) => handleSelectChange('satServiceKey', v)}><SelectTrigger><SelectValue placeholder="Seleccione"/></SelectTrigger><SelectContent><SelectItem value="85121500">85121500 - Servicios de laboratorios médicos</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="satUnitKey">Clave de Unidad</Label><Select value={formData.satUnitKey} onValueChange={(v) => handleSelectChange('satUnitKey', v)}><SelectTrigger><SelectValue placeholder="Seleccione"/></SelectTrigger><SelectContent><SelectItem value="E48">E48 - Unidad de servicio</SelectItem></SelectContent></Select></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Parámetros del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PARÁMETRO</TableHead>
                                    <TableHead>UNIDAD DE MEDIDA</TableHead>
                                    <TableHead>COSTO INDIVIDUAL</TableHead>
                                    <TableHead>FACTOR DE CONVERSIÓN</TableHead>
                                    <TableHead>TIPO DE VALOR DE REFERENCIA</TableHead>
                                    <TableHead>ELIMINAR</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.parameters?.map((param, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{param.name}</TableCell>
                                        <TableCell>{param.unit}</TableCell>
                                        <TableCell>{param.cost}</TableCell>
                                        <TableCell>{param.factor}</TableCell>
                                        <TableCell>{param.referenceType}</TableCell>
                                        <TableCell>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveParameter(index)}><Trash2/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="p-4 border rounded-md space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2"><Label>Parámetro</Label><Input placeholder="Nombre" value={newParam.name} onChange={(e) => setNewParam({...newParam, name: e.target.value})}/></div>
                            <div className="space-y-2"><Label>Unidad</Label><Input placeholder="Unidad" value={newParam.unit} onChange={(e) => setNewParam({...newParam, unit: e.target.value})}/></div>
                            <div className="space-y-2"><Label>Costo</Label><Input type="number" placeholder="0.00" value={newParam.cost} onChange={(e) => setNewParam({...newParam, cost: parseFloat(e.target.value) || 0})}/></div>
                            <div className="space-y-2"><Label>Factor Conversión</Label><Input placeholder="U.I" value={newParam.factor} onChange={(e) => setNewParam({...newParam, factor: e.target.value})}/></div>
                            <div className="space-y-2"><Label>Tipo Ref.</Label><Input placeholder="Tipo" value={newParam.referenceType} onChange={(e) => setNewParam({...newParam, referenceType: e.target.value})}/></div>
                        </div>
                        <Button type="button" onClick={handleAddParameter}><Plus className="mr-2"/> Agregar Parametro</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="integran" className="pt-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base text-primary">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>¿Se está registrando un examen con sub-exámenes?</Label>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                         <RadioGroup value={formData.hasSubStudies ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('hasSubStudies', v === 'yes')} className="flex gap-4 mt-2">
                             <RadioGroupItem value="yes" id="subexam-yes"/><Label htmlFor="subexam-yes">Si</Label>
                             <RadioGroupItem value="no" id="subexam-no"/><Label htmlFor="subexam-no">No</Label>
                         </RadioGroup>
                        <p className="text-xs text-muted-foreground">Al seleccionar la opción Sí, en el módulo de Reporte de Resultados podrá capturar los resultados por separado para cada uno de los estudios que lo integran. Así mismo en el módulo de Entrega de Resultados podrá realizar la impresión de forma individual de cada uno de los estudios que lo conforman.</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>¿Se está registrando un paquete?</Label>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <RadioGroup value={formData.isPackage ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('isPackage', v === 'yes')} className="flex gap-4 mt-2">
                             <RadioGroupItem value="yes" id="pkg-yes"/><Label htmlFor="pkg-yes">Si</Label>
                             <RadioGroupItem value="no" id="pkg-no"/><Label htmlFor="pkg-no">No</Label>
                         </RadioGroup>
                         <p className="text-xs text-muted-foreground">Al ser afirmativa, en el módulo de Solicitud de Exámenes; podremos elegir los parámetros que lo conforman, a petición del paciente. Por ejemplo Qs 35; podremos seleccionar solo los estudios que necesitemos.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base text-primary">Búsqueda y Asignación de Estudios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Instrucciones:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            <li>Para agregar el estudio deberá realizar la búsqueda por su código ó bien por nombre y seleccionarlo, pasando de forma automática a la lista que se muestra a la derecha.</li>
                            <li>Si desea eliminarlo, seleccione el estudio deseado de la lista y de clic en el botón Quitar estudio interno de la lista</li>
                            <li>Si desea cambiar el orden en el que se muestran los estudios, seleccione las flechas ubicadas en el costado derecho de la lista</li>
                        </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="study-search">Nombre del estudio:</Label>
                                <Input id="study-search" value={studySearchTerm} onChange={(e) => setStudySearchTerm(e.target.value)} placeholder="Buscar por nombre o código"/>
                            </div>
                            {studySearchTerm && (
                                <div className="border rounded-md max-h-40 overflow-y-auto">
                                    {filteredStudies.map(study => (
                                        <div key={study.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => addIntegratedStudy(study)}>
                                            {study.name} ({study.code})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                         <div className="space-y-2">
                             <Label>Estudios integrados:</Label>
                            <div className="border rounded-md h-48 overflow-y-auto p-1 space-y-1">
                                {formData.integratedStudies?.map(study => (
                                     <div key={study.id}
                                          className={`p-2 rounded-md cursor-pointer ${selectedIntegratedStudy === String(study.id) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                          onClick={() => setSelectedIntegratedStudy(String(study.id))}>
                                         {study.name}
                                     </div>
                                ))}
                            </div>
                            <div className="flex justify-between">
                                <Button type="button" variant="destructive" size="sm" onClick={removeIntegratedStudy} disabled={!selectedIntegratedStudy}>
                                    <Trash2 className="mr-2 h-4 w-4"/> Quitar estudio de la lista
                                </Button>
                                <div className="flex gap-2">
                                    <Button type="button" size="icon" variant="outline"><ArrowUp/></Button>
                                    <Button type="button" size="icon" variant="outline"><ArrowDown/></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
        <TabsContent value="sinonimos" className="pt-4">
            <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Sinónimos de Identificación del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        {(formData.synonyms || []).map((synonym, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={synonym}
                                    onChange={(e) => handleSynonymChange(index, e.target.value)}
                                    placeholder={`Sinónimo ${index + 1}`}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeSynonym(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" onClick={addSynonym} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Agregar Sinónimo
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="muestras" className="pt-4">
            <Card>
                 <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Muestras del Estudio</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>TIPO DE MUESTRA</TableHead>
                                    <TableHead>CONTENEDOR</TableHead>
                                    <TableHead>INDICACIONES</TableHead>
                                    <TableHead>COSTO</TableHead>
                                    <TableHead>ELIMINAR</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.samples?.map((sample, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{sample.type}</TableCell>
                                        <TableCell>{sample.container}</TableCell>
                                        <TableCell>{sample.indications}</TableCell>
                                        <TableCell>{sample.cost.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSample(index)}><Trash2/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="p-4 border rounded-md space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2"><Label>Tipo de Muestra</Label><Input value={newSample.type} onChange={(e) => setNewSample({...newSample, type: e.target.value})} placeholder="Ej. Sangre"/></div>
                            <div className="space-y-2"><Label>Contenedor</Label><Input value={newSample.container} onChange={(e) => setNewSample({...newSample, container: e.target.value})} placeholder="Ej. Tubo Rojo"/></div>
                            <div className="space-y-2"><Label>Indicaciones</Label><Input value={newSample.indications} onChange={(e) => setNewSample({...newSample, indications: e.target.value})} placeholder="Ej. Ayuno de 8 hrs"/></div>
                            <div className="space-y-2"><Label>Costo</Label><Input type="number" value={newSample.cost} onChange={(e) => setNewSample({...newSample, cost: parseFloat(e.target.value) || 0})} placeholder="0.00"/></div>
                        </div>
                        <Button type="button" onClick={handleAddSample}><Plus className="mr-2"/> Agregar Muestra</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Guardando...' : <><Save className="mr-2"/> Guardar Estudio</>}
        </Button>
      </div>
    </form>
  );
}
