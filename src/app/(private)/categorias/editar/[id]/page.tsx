
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { getCategoryById, updateCategory } from "@/services/categoryService";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const categorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);
  const { toast } = useToast();
  const loader = useLoader();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (categoryId) {
      loader.start("read");
      getCategoryById(categoryId)
        .then((categoryData) => {
          if (categoryData) {
            form.setValue("name", categoryData.name);
          } else {
            toast({
              title: "Error",
              description: "Categoría no encontrada.",
              variant: "destructive",
            });
            router.push("/categorias");
          }
        })
        .catch((error) => {
          console.error("Error fetching category:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos de la categoría.",
            variant: "destructive",
          });
        })
        .finally(() => loader.stop());
    }
  }, [categoryId, router, toast, form, loader]);

  const onSubmit = async (data: CategoryFormValues) => {
    loader.start("update");
    try {
      await updateCategory(categoryId, data.name);
      toast({
        title: "Éxito",
        description: "La categoría se ha actualizado correctamente.",
      });
      router.push("/categorias");
    } catch (error) {
      console.error("Error updating category: ", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría.",
        variant: "destructive",
      });
    } finally {
        loader.stop();
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
          <Link href="/" className="hover:text-primary">
            Hogar
          </Link>{" "}
          /{" "}
          <Link href="/categorias" className="hover:text-primary">
            Categorías
          </Link>{" "}
          / Editar categoría
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de la categoría"
                        {...field}
                        disabled={loader.status !== 'idle'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start">
                <Button type="submit" disabled={loader.status !== 'idle'}>
                  <Check className="mr-2" />
                  {loader.status === 'update' ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
