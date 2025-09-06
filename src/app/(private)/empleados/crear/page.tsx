import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import Link from "next/link";
import { getBranches } from "@/services/branchService"; // <--- Importamos el servicio de sucursales
import CreateEmployeeForm from "./CreateEmployeeForm"; // <--- Importamos el nuevo componente de formulario

// La página ahora es un componente de servidor asíncrono.
export default async function CreateEmployeePage() {
  // Obtenemos los datos de las sucursales en el servidor.
  const branches = await getBranches();

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/empleados" className="hover:text-primary">Empleados</Link> / Crear Empleado
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crear Empleado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
          {/* Renderizamos el componente de cliente y le pasamos las sucursales como prop. */}
          <CreateEmployeeForm branches={branches} />
        </CardContent>
      </Card>
    </div>
  );
}
