
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createConvenio } from "@/services/conveniosServicio";

const HandshakeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-handshake h-8 w-8 text-primary"
    >
      <path d="M11 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1" />
      <path d="M13 17a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
      <path d="M12.5 17.1L11 15.5" />
      <path d="M8.5 12.8L10 11.3" />
      <path d="m15 11.3 1.5 1.5" />
      <path d="m3 7 3 3" />
      <path d="m18 7 3 3" />
    </svg>
);

const convenioSchema = z.object({
  title: z.string().min(1, { message: "El título es requerido." }),
  descuento: z.coerce.number().min(0, "El descuento no puede ser negativo.").max(100, "El descuento no puede ser mayor a 100."),
  items: z.array(z.object({
    type: z.string(),
    id: z.number(),
    nombre: z.string(),
    price: z.string(),
  })).optional()
});

type ConvenioFormValues = z.infer<typeof convenioSchema>;

export default function CreateConvenioPage() {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<ConvenioFormValues>({
        resolver: zodResolver(convenioSchema),
        defaultValues: {
            title: '',
            descuento: 0,
            items: [],
        }
    });

    const onSubmit = async (data: ConvenioFormValues) => {
        try {
            await createConvenio(data);
            toast({
                title: "Éxito",
                description: "Convenio creado correctamente.",
            });
            form.reset();
            setTimeout(() => router.push('/convenios'), 500);
        } catch (error) {
            console.error("Error creating convenio: ", error);
            toast({
                title: "Error",
                description: "No se pudo crear el convenio.",
                variant: "destructive",
            });
        }
    };

    // Placeholder function, as the logic for adding items is complex
    const addItem = () => {
        toast({
            title: "Función no implementada",
            description: "La búsqueda y adición de pruebas y paquetes se implementará en el futuro.",
        });
    }
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <HandshakeIcon />
          <h1 className="text-2xl font-bold">Convenios</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/convenios" className="hover:text-primary">Convenios</Link> / Crear convenio
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear convenio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título del convenio</FormLabel><FormControl><Input placeholder="Título del convenio" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="descuento" render={({ field }) => (
                            <FormItem><FormLabel>Porcentaje de descuento</FormLabel>
                                <div className="relative">
                                    <FormControl><Input type="number" placeholder="0" {...field} onFocus={handleFocus} /></FormControl>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                </div>
                            <FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Pruebas y Paquetes</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Prueba/Paquete</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <Button type="button" variant="outline" onClick={addItem}>
                                                <Plus className="mr-2 h-4 w-4" /> Añadir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    
                    <div className="flex justify-start">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <Check className="mr-2"/> {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
