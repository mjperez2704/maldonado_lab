
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Printer,
  Search,
  FileCheck,
  Download,
  Calendar,
  User,
  Hash
} from "lucide-react";
import Link from "next/link";


export default function DeliveryResultsPage() {

    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Printer className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Entrega de Resultados</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / Entrega de Resultados
                </div>
            </div>

            <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2"><Search /> Búsqueda de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="folio">Folio</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="folio" placeholder="Buscar por folio" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient">Paciente</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="patient" placeholder="Buscar por nombre" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha Inicial</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="startDate" type="date" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha Final</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="endDate" type="date" className="pl-10" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resultados Validados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No hay resultados validados para mostrar. Realice una búsqueda para empezar.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

