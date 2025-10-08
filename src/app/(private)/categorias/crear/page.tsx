
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ListTree } from "lucide-react";
import { createCategory } from "@/services/categoriasServicio";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const categoriaSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
});

type CategoryFormValues = z.infer<typeof categoriaSchema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    let success = false;
    loader.start("create");
    try {
      await createCategory(data.nombre);
      toast({
        title: "Éxito",
        description: "La categoría se ha creado correctamente.",
      });
      form.reset(); // Limpia el formulario
      success = true;
    } catch (error) {
      console.error("Error creating categoria: ", error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría.",
        variant: "destructive",
      });
    } finally {
      loader.stop();
      if (success) {
        setTimeout(() => router.push('/categorias'), 500);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ListTree className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Categorías</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/categorias" className="hover:text-primary">Categorías</Link> / Crear categoría
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                nombre="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la categoría" {...field} disabled={loader.status !== 'idle'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start">
                <Button type="submit" disabled={loader.status !== 'idle'}>
                  <Check className="mr-2"/> {loader.status === 'create' ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
