import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import Link from "next/link";
import { getBranches } from "@/services/branchService";
import { getEmployeeById } from "@/services/employeeService";
import EditEmployeeForm from "./EditEmployeeForm";
import { notFound } from "next/navigation";

// Definimos las props que recibirá la página desde la URL (el 'id' del empleado)
interface EditEmployeePageProps {
    params: {
        id: string;
    }
}

// La página ahora es un componente de servidor asíncrono.
export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const employeeId = Number(params.id);

  // Obtenemos los datos en paralelo para mayor eficiencia.
  const [employee, branches] = await Promise.all([
    getEmployeeById(employeeId),
    getBranches()
  ]);

  // Si el empleado no se encuentra, mostramos una página 404.
  if (!employee) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/empleados" className="hover:text-primary">Empleados</Link> / Editar Empleado
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar Empleado</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-6">
          {/* Renderizamos el componente de cliente con los datos obtenidos. */}
          <EditEmployeeForm branches={branches} employee={employee} />
        </CardContent>
      </Card>
    </div>
  );
}
