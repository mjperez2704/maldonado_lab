

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, Plus, Trash2, Save, HelpCircle, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { getEstudioById, updateEstudio, getStudies as getAllStudies, Estudio, ParametroEstudio, IntegratedEstudioRef, MuestraEstudio } from "@/services/estudiosServicio";
import { getCategories, Category } from "@/services/categoriasServicio";
import { getProveedores, Proveedor } from "@/services/proveedoresServicio";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialNewParam: Omit<ParametroEstudio, 'estudio_id'> = {
    nombre: '',
    unidad_medida: '',
    costo: 0,
    factor: '',
    tipo_referencia: 'Intervalo',
    sexo: 'Ambos',
    edad_inicio: 0,
    edad_fin: 99,
    unidad_edad: 'Anos',
    referencia_inicio_a: '',
    referencia_fin_a: '',
    posiblesValores: [],
};


function ParameterForm({ onSave, initialData = initialNewParam }: { onSave: (param: ParametroEstudio) => void, initialData?: Omit<ParametroEstudio, 'estudio_id'> }) {
    const [param, setParam] = useState<Omit<ParametroEstudio, 'estudio_id'>>(initialData);
    const [newPossibleValue, setNewPossibleValue] = useState('');

    useEffect(() => {
        setParam(initialData);
    }, [initialData]);

    const handleAddPossibleValue = () => {
        if (newPossibleValue.trim()) {
            setParam(prev => ({ ...prev, posiblesValores: [...(prev.posiblesValores || []), newPossibleValue.trim()] }));
            setNewPossibleValue('');
        }
    };
    
    const handleRemovePossibleValue = (valueToRemove: string) => {
        setParam(prev => ({ ...prev, posiblesValores: (prev.posiblesValores || []).filter(v => v !== valueToRemove) }));
    };

    const handleSave = () => {
        onSave({ ...param, estudio_id: 0 }); // estudio_id will be handled by the parent
    };

    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1 lg:col-span-2"><Label>Parámetro</Label><Input placeholder="Nombre del Parámetro" value={param.nombre} onChange={(e) => setParam({...param, nombre: e.target.value})}/></div>
                <div className="space-y-1"><Label>Unidad de Medida</Label><Input placeholder="ej. mg/dL" value={param.unidad_medida} onChange={(e) => setParam({...param, unidad_medida: e.target.value})}/></div>
                <div className="space-y-1"><Label>Costo</Label><Input type="number" placeholder="0.00" value={param.costo} onChange={(e) => setParam({...param, costo: parseFloat(e.target.value) || 0})}/></div>
                <div className="space-y-1"><Label>Factor Conv.</Label><Input placeholder="FC" value={param.factor} onChange={(e) => setParam({...param, factor: e.target.value})}/></div>
             </div>
             <div className="col-span-full"><Label>Tipo de Valor de Referencia</Label><RadioGroup value={param.tipo_referencia} onValueChange={(v) => setParam({...param, tipo_referencia: v})} className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Intervalo" id="ref-intervalo-edit" /><Label htmlFor="ref-intervalo-edit">Intervalo</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Mixto" id="ref-mixto-edit" /><Label htmlFor="ref-mixto-edit">Mixto</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Criterio" id="ref-criterio-edit" /><Label htmlFor="ref-criterio-edit">Criterio</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Sin_referencia" id="ref-sin-valor-edit" /><Label htmlFor="ref-sin-valor-edit">Sin referencia</Label></div>
                </RadioGroup></div>

            {param.tipo_referencia === 'Intervalo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                    <div className="space-y-2"><Label>Género</Label><RadioGroup value={param.sexo} onValueChange={(v) => setParam({...param, sexo: v as any})} className="flex pt-2 gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="Masculino" id="gender-h-edit"/><Label htmlFor="gender-h-edit">Hombre</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Femenino" id="gender-m-edit"/><Label htmlFor="gender-m-edit">Mujer</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Ambos" id="gender-a-edit"/><Label htmlFor="gender-a-edit">Ambos</Label></div></RadioGroup></div>
                    <div className="space-y-2"><Label>Edad</Label><div className="flex items-center gap-2"><Input placeholder="De" type="number" value={param.edad_inicio} onChange={(e) => setParam({...param, edad_inicio: Number(e.target.value)})}/><span>a</span><Input placeholder="A" type="number" value={param.edad_fin} onChange={(e) => setParam({...param, edad_fin: Number(e.target.value)})}/><Select value={param.unidad_edad} onValueChange={(v) => setParam({...param, unidad_edad: v as any})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Dias">Días</SelectItem><SelectItem value="Meses">Meses</SelectItem><SelectItem value="Anos">Años</SelectItem></SelectContent></Select></div></div>
                    <div className="md:col-span-2 space-y-2"><Label>Intervalo de Referencia</Label><div className="flex items-center gap-2"><Input placeholder="Valor Mínimo" value={param.referencia_inicio_a || ''} onChange={(e) => setParam({...param, referencia_inicio_a: e.target.value})}/><span>-</span><Input placeholder="Valor Máximo" value={param.referencia_fin_a || ''} onChange={(e) => setParam({...param, referencia_fin_a: e.target.value})}/></div></div>
                </div>
            )}
             {param.tipo_referencia === 'Mixto' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                    <div className="space-y-2">
                        <Label>Valores Posibles</Label>
                        <div className="flex items-center gap-2">
                            <Input placeholder="Añadir valor posible" value={newPossibleValue} onChange={(e) => setNewPossibleValue(e.target.value)} />
                            <Button type="button" size="sm" onClick={handleAddPossibleValue}>Agregar</Button>
                        </div>
                        <div className="border rounded-md p-2 min-h-[100px] space-y-1">
                            {(param.posiblesValores || []).map((val, i) => (
                                <div key={i} className="flex justify-between items-center p-1 hover:bg-background rounded-md">
                                    <span>{val}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemovePossibleValue(val)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Valor Predeterminado (Opcional)</Label>
                            <Select value={param.valorDefault} onValueChange={(v) => setParam({...param, valorDefault: v})}>
                                <SelectTrigger><SelectValue placeholder="Seleccione un valor predeterminado"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_NULL_">Ninguno</SelectItem>
                                    {(param.posiblesValores || []).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                            <div className="space-y-2">
                            <Label>Valor de Referencia</Label>
                            <Select value={param.valorReferencia} onValueChange={(v) => setParam({...param, valorReferencia: v})}>
                                <SelectTrigger><SelectValue placeholder="Seleccione el valor de referencia"/></SelectTrigger>
                                <SelectContent>
                                    {(param.posiblesValores || []).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
            {param.tipo_referencia === 'Criterio' && (
                <div className="p-4 bg-muted/50 rounded-md">
                    <div className="space-y-2">
                        <Label htmlFor="referenceText-edit">Texto de Referencia (Criterio)</Label>
                        <Textarea
                            id="referenceText-edit"
                            placeholder="Ej: Menor de 1.0 ng/mL"
                            value={param.texto_referencia || ''}
                            onChange={(e) => setParam({...param, texto_referencia: e.target.value})}
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button type="button" onClick={handleSave}>Guardar Parámetro</Button>
            </DialogFooter>
        </div>
    );
}

export default function EditEstudioPage() {
    const router = useRouter();
    const params = useParams();
    const studyId = params.id as string;
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<Omit<Estudio, 'id'>>({
        area: '', codigo: '', nombre: '', metodo: '', costoInterno: 0, tiempoEntrega: 0,
        unidadEntrega: 'dias', tiempoProceso: '', diasProceso: '', esSubcontratado: false,
        laboratorio_externo_id: '', coidgoExterno: '', costoExterno: 0, tiempoEntregaExterno: '',
        leyenda: '', descripcionCientifica: '', claveServicioSat: '', claveUnidadSat: '',
        parameters: [],
        configuracion: {
            showInRequest: false, canUploadDocuments: false, printLabSignature: false,
            printWebSignature: false, hasEnglishHeaders: false, printWithParams: false,
            generateWorkOrder: false,
        },
        tieneSubestudios: false,
        esPaquete: false,
        integratedStudies: [],
        sinonimo: [''],
        muestras: [],
        precio: 0, tipo_muestra_id: '', categoria: '', abreviatura: '',
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [allStudies, setAllStudies] = useState<Estudio[]>([]);
    
    const [isParamModalOpen, setIsParamModalOpen] = useState(false);
    const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);

    const [newSample, setNewSample] = useState<MuestraEstudio>({ type: '', container: '', indications: '', cost: 0 });
    const [studySearchTerm, setEstudioSearchTerm] = useState('');
    const [selectedIntegratedEstudio, setSelectedIntegratedEstudio] = useState<string | null>(null);

    useEffect(() => {
        if (studyId) {
            const fetchData = async () => {
                try {
                    const [studyData, cats, provs, estudios] = await Promise.all([
                        getEstudioById(studyId),
                        getCategories(),
                        getProveedores(),
                        getAllStudies(),
                    ]);

                    if (studyData) {
                        setFormData({
                          ...studyData,
                          sinonimo: studyData.sinonimo?.length ? studyData.sinonimo : [''],
                          muestras: studyData.muestras || [],
                          parameters: studyData.parameters || [],
                          integratedStudies: studyData.integratedStudies || [],
                        });
                    } else {
                        toast({ title: "Error", description: "Estudio no encontrado.", variant: "destructive" });
                        router.push('/estudios');
                    }
                    setCategories(cats);
                    setProviders(provs);
                    setAllStudies(estudios);
                } catch (error) {
                    console.error("Error fetching data", error);
                    toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            };
            fetchData().then(() => {});
        }
    }, [studyId, router, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSelectChange = (id: keyof Omit<Estudio, 'id'>, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleConfigChange = (id: keyof Estudio['configuracion'], value: boolean) => {
        setFormData(prev => ({ ...prev, configuracion: { ...prev.configuracion, [id]: value } }));
    };

    const handleSaveParameter = (param: ParametroEstudio) => {
        if (editingParamIndex !== null) {
            const updatedParameters = [...(formData.parameters || [])];
            updatedParameters[editingParamIndex] = param;
            setFormData(prev => ({ ...prev, parameters: updatedParameters }));
        } else {
            setFormData(prev => ({...prev, parameters: [...(prev.parameters || []), param]}));
        }
        setIsParamModalOpen(false);
        setEditingParamIndex(null);
    };

    const handleEditParameter = (index: number) => {
        setEditingParamIndex(index);
        setIsParamModalOpen(true);
    };

    const handleRemoveParameter = (index: number) => {
        setFormData(prev => ({
            ...prev,
            parameters: (prev.parameters || []).filter((_, i) => i !== index)
        }));
    };

    // --- Integrated Studies Logic ---
    const filteredStudies = allStudies.filter(study =>
        (study.nombre.toLowerCase().includes(studySearchTerm.toLowerCase()) ||
         (study.codigo || '').toLowerCase().includes(studySearchTerm.toLowerCase())) &&
        !formData.integratedStudies?.some(is => is.id === study.id)
    ).slice(0, 10);

    const addIntegratedEstudio = (study: Estudio) => {
        const newIntegratedEstudio: IntegratedEstudioRef = { id: study.id, nombre: study.nombre };
        setFormData(prev => ({
            ...prev,
            integratedStudies: [...(prev.integratedStudies || []), newIntegratedEstudio]
        }));
        setEstudioSearchTerm('');
    };

    const removeIntegratedEstudio = () => {
        if (!selectedIntegratedEstudio) return;
        setFormData(prev => ({
            ...prev,
            integratedStudies: (prev.integratedStudies || []).filter(s => String(s.id) !== selectedIntegratedEstudio)
        }));
        setSelectedIntegratedEstudio(null);
    };

    // --- Synonyms Logic ---
    const handleSynonymChange = (index: number, value: string) => {
        const newSynonyms = [...(formData.sinonimo || [])];
        newSynonyms[index] = value;
        setFormData(prev => ({ ...prev, sinonimo: newSynonyms }));
    };

    const addSynonym = () => {
        setFormData(prev => ({ ...prev, sinonimo: [...(prev.sinonimo || []), ''] }));
    };

    const removeSynonym = (index: number) => {
        setFormData(prev => ({ ...prev, sinonimo: (prev.sinonimo || []).filter((_, i) => i !== index) }));
    };

    // --- Samples Logic ---
    const handleAddSample = () => {
        if (!newSample.type) {
            toast({ title: "Error", description: "El tipo de muestra no puede estar vacío.", variant: "destructive" });
            return;
        }
        setFormData(prev => ({...prev, muestras: [...(prev.muestras || []), newSample]}));
        setNewSample({ type: '', container: '', indications: '', cost: 0 }); // Reset
    };

    const handleRemoveSample = (index: number) => {
        setFormData(prev => ({ ...prev, muestras: (prev.muestras || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalData = {
                ...formData,
                sinonimo: formData.sinonimo?.filter(s => s.trim() !== '')
            };
            await updateEstudio(studyId, finalData);
            toast({ title: "Éxito", description: "Estudio actualizado correctamente." });
            router.push('/estudios');
        } catch (error) {
            console.error("Error updating study:", error);
            toast({ title: "Error", description: "No se pudo actualizar el estudio.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const getParameterDisplayReference = (param: ParametroEstudio) => {
        switch (param.tipo_referencia) {
            case 'Intervalo':
                return `(${param.sexo}) ${param.referencia_inicio_a} - ${param.referencia_fin_a}`;
            case 'Mixto':
                return param.valorReferencia || 'N/A';
            case 'Criterio':
                return param.texto_referencia || 'N/A';
            default:
                return 'N/A';
        }
    };

    const renderConfigRadio = (id: keyof Estudio['configuracion'], label: string) => (
        <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
                <Label htmlFor={id} className="text-sm">{label}</Label>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <RadioGroup id={id} value={formData.configuracion[id] ? "yes" : "no"} onValueChange={(value) => handleConfigChange(id, value === 'yes')} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${id}-yes-edit`} /><Label htmlFor={`${id}-yes-edit`}>Si</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${id}-no-edit`} /><Label htmlFor={`${id}-no-edit`}>No</Label></div>
            </RadioGroup>
        </div>
    );

    if(loading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-primary">Estudios</h1>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/estudios" className="hover:text-primary">Estudios</Link> / Editar Estudio
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
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="area">Área*</Label><Select value={formData.area} onValueChange={(v) => handleSelectChange('area', v)} required><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="codigo">Código</Label><Input id="codigo" value={formData.codigo || ''} onChange={handleChange}/></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="nombre">Nombre*</Label><Input id="nombre" value={formData.nombre} onChange={handleChange} required/></div>
                    <div className="space-y-2 lg:col-span-1"><Label htmlFor="metodo">Método</Label><Input id="metodo" value={formData.metodo || ''} onChange={handleChange}/></div>
                    <div className="space-y-2"><Label htmlFor="costoInterno">Costo interno p/prueba</Label><Input id="costoInterno" type="number" value={formData.costoInterno} onChange={handleChange}/></div>
                    <div className="space-y-2"><Label htmlFor="precio">Precio</Label><Input id="precio" type="number" value={formData.precio} onChange={handleChange}/></div>
                    <div className="space-y-2"><Label>Tiempo de entrega</Label><div className="flex gap-2"><Input id="tiempoEntrega" type="number" className="w-1/2" value={formData.tiempoEntrega} onChange={handleChange}/><Select value={formData.unidadEntrega} onValueChange={(v) => handleSelectChange('unidadEntrega', v as 'dias' | 'horas')}><SelectTrigger className="w-1/2"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="horas">Horas</SelectItem><SelectItem value="dias">Días</SelectItem></SelectContent></Select></div></div>
                    <div className="space-y-2"><Label htmlFor="tiempoProceso">Tiempo de Proceso</Label><Select value={formData.tiempoProceso} onValueChange={(v) => handleSelectChange('tiempoProceso', v)}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent><SelectItem value="mismo_dia">Mismo día</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="diasProceso">Días de Proceso</Label><Input id="diasProceso" value={formData.diasProceso || ''} onChange={handleChange}/></div>

                    <div className="space-y-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 items-center border-t pt-4">
                        <div className="lg:col-span-1"><Label>¿Este es un estudio subrogado?</Label><RadioGroup value={formData.esSubcontratado ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('esSubcontratado', v === 'yes')} className="flex gap-4 mt-2"><RadioGroupItem value="yes" id="sub-yes-edit"/><Label htmlFor="sub-yes-edit">Si</Label><RadioGroupItem value="no" id="sub-no-edit"/><Label htmlFor="sub-no-edit">No</Label></RadioGroup></div>
                        <div className="space-y-2 lg:col-span-2"><Label htmlFor="laboratorio_externo_id">Lab. de Referencia</Label><Select value={formData.laboratorio_externo_id} onValueChange={(v) => handleSelectChange('laboratorio_externo_id', v)} disabled={!formData.esSubcontratado}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{providers.map(p=><SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="coidgoExterno">Código</Label><Input id="coidgoExterno" value={formData.coidgoExterno || ''} onChange={handleChange} disabled={!formData.esSubcontratado}/></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="costoExterno">Costo</Label><Input id="costoExterno" type="number" value={formData.costoExterno} onChange={handleChange} disabled={!formData.esSubcontratado}/></div>
                        <div className="space-y-2 lg:col-span-1"><Label htmlFor="tiempoEntregaExterno">Tiempo de entrega</Label><Select value={formData.tiempoEntregaExterno} onValueChange={(v) => handleSelectChange('tiempoEntregaExterno', v)} disabled={!formData.esSubcontratado}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent><SelectItem value="3_dias">3 días</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="lg:col-span-4 space-y-2"><Label htmlFor="leyenda">Leyenda/Observaciones del estudio</Label><Textarea id="leyenda" value={formData.leyenda || ''} onChange={handleChange}/></div>
                    <div className="lg:col-span-4 space-y-2"><Label htmlFor="descripcionCientifica">Descripción científica</Label><Textarea id="descripcionCientifica" value={formData.descripcionCientifica || ''} onChange={handleChange}/></div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-base text-primary">Datos de Facturación (México)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="claveServicioSat">Clave del Servicio</Label><Select value={formData.claveServicioSat} onValueChange={(v) => handleSelectChange('claveServicioSat', v)}><SelectTrigger><SelectValue placeholder="Seleccione"/></SelectTrigger><SelectContent><SelectItem value="85121500">85121500 - Servicios de laboratorios médicos</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="claveUnidadSat">Clave de Unidad</Label><Select value={formData.claveUnidadSat} onValueChange={(v) => handleSelectChange('claveUnidadSat', v)}><SelectTrigger><SelectValue placeholder="Seleccione"/></SelectTrigger><SelectContent><SelectItem value="E48">E48 - Unidad de servicio</SelectItem></SelectContent></Select></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="bg-primary/10 flex flex-row items-center justify-between">
                    <CardTitle className="text-base text-primary">Parámetros del Estudio</CardTitle>
                     <Button type="button" onClick={() => { setEditingParamIndex(null); setIsParamModalOpen(true); }}><Plus className="mr-2"/> Agregar Parámetro</Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parámetro</TableHead>
                                    <TableHead>Unidad</TableHead>
                                    <TableHead>Ref.</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.parameters?.map((param, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{param.nombre}</TableCell>
                                        <TableCell>{param.unidad_medida}</TableCell>
                                        <TableCell>{getParameterDisplayReference(param)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleEditParameter(index)}><Pencil className="h-4 w-4"/></Button>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveParameter(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            
            <Dialog open={isParamModalOpen} onOpenChange={setIsParamModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editingParamIndex !== null ? 'Editar' : 'Agregar'} Parámetro</DialogTitle>
                    </DialogHeader>
                    <ParameterForm
                        initialData={editingParamIndex !== null && formData.parameters ? formData.parameters[editingParamIndex] : initialNewParam}
                        onSave={handleSaveParameter}
                    />
                </DialogContent>
            </Dialog>

        </TabsContent>
         <TabsContent value="integran" className="pt-4 space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base text-primary">Configuración</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2"><div className="flex items-center gap-2"><Label>¿Se está registrando un examen con sub-exámenes?</Label><Info className="h-4 w-4 text-muted-foreground" /></div><RadioGroup value={formData.tieneSubestudios ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('tieneSubestudios', v === 'yes')} className="flex gap-4 mt-2"><RadioGroupItem value="yes" id="subexam-yes-edit"/><Label htmlFor="subexam-yes-edit">Si</Label><RadioGroupItem value="no" id="subexam-no-edit"/><Label htmlFor="subexam-no-edit">No</Label></RadioGroup><p className="text-xs text-muted-foreground">Al seleccionar la opción Sí, podrá capturar los resultados por separado para cada uno de los estudios que lo integran.</p></div>
                     <div className="space-y-2"><div className="flex items-center gap-2"><Label>¿Se está registrando un paquete?</Label><Info className="h-4 w-4 text-muted-foreground" /></div><RadioGroup value={formData.esPaquete ? 'yes' : 'no'} onValueChange={(v) => handleSelectChange('esPaquete', v === 'yes')} className="flex gap-4 mt-2"><RadioGroupItem value="yes" id="pkg-yes-edit"/><Label htmlFor="pkg-yes-edit">Si</Label><RadioGroupItem value="no" id="pkg-no-edit"/><Label htmlFor="pkg-no-edit">No</Label></RadioGroup><p className="text-xs text-muted-foreground">Al ser afirmativa, en la Solicitud de Exámenes podremos elegir los parámetros que lo conforman.</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="text-base text-primary">Búsqueda y Asignación de Estudios</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="study-search">Nombre del estudio:</Label><Input id="study-search" value={studySearchTerm} onChange={(e) => setEstudioSearchTerm(e.target.value)} placeholder="Buscar por nombre o código"/></div>
                            {studySearchTerm && (
                                <div className="border rounded-md max-h-40 overflow-y-auto">{filteredStudies.map(study => (<div key={study.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => addIntegratedEstudio(study)}>{study.nombre} ({study.codigo})</div>))}</div>
                            )}
                        </div>
                         <div className="space-y-2"><Label>Estudios integrados:</Label><div className="border rounded-md h-48 overflow-y-auto p-1 space-y-1">{formData.integratedStudies?.map(study => (<div key={study.id} className={`p-2 rounded-md cursor-pointer ${Number(selectedIntegratedEstudio) === study.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`} onClick={() => setSelectedIntegratedEstudio(String(study.id))}>{study.nombre}</div>))}</div><div className="flex justify-between"><Button type="button" variant="destructive" size="sm" onClick={removeIntegratedEstudio} disabled={!selectedIntegratedEstudio}><Trash2 className="mr-2 h-4 w-4"/> Quitar</Button><div className="flex gap-2"><Button type="button" size="icon" variant="outline"><ArrowUp/></Button><Button type="button" size="icon" variant="outline"><ArrowDown/></Button></div></div></div>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
        <TabsContent value="sinonimos" className="pt-4">
            <Card>
                <CardHeader><CardTitle className="text-base text-primary">Sinónimos de Identificación del Estudio</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">{(formData.sinonimo || []).map((synonym, index) => (<div key={index} className="flex items-center gap-2"><Input value={synonym} onChange={(e) => handleSynonymChange(index, e.target.value)} placeholder={`Sinónimo ${index + 1}`}/><Button type="button" variant="destructive" size="icon" onClick={() => removeSynonym(index)}><Trash2 className="h-4 w-4" /></Button></div>))}</div>
                    <Button type="button" onClick={addSynonym} className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> Agregar Sinónimo</Button>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="muestras" className="pt-4">
            <Card>
                 <CardHeader><CardTitle className="text-base text-primary">Muestras del Estudio</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                     <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>TIPO DE MUESTRA</TableHead><TableHead>CONTENEDOR</TableHead><TableHead>INDICACIONES</TableHead><TableHead>COSTO</TableHead><TableHead>ELIMINAR</TableHead></TableRow></TableHeader><TableBody>{formData.muestras?.map((sample, index) => (<TableRow key={index}><TableCell>{sample.type}</TableCell><TableCell>{sample.container}</TableCell><TableCell>{sample.indications}</TableCell><TableCell>{Number(sample.cost).toFixed(2)}</TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSample(index)}><Trash2/></Button></TableCell></TableRow>))}</TableBody></Table></div>
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
            {loading ? 'Guardando...' : <><Save className="mr-2"/> Guardar Cambios</>}
        </Button>
      </div>
    </form>
  );
}
