
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import {
  LayoutGrid,
  Users,
  FlaskConical,
  FileText,
  Printer,
  ClipboardList,
  FileStack,
  Building,
  BarChart,
  User,
  Pill,
  Calculator,
  Newspaper,
  CreditCard,
  PlusSquare,
  BadgePercent,
  UserCheck,
  FileDown,
  Settings,
  Landmark,
  FileKey,
  NotebookTabs,
  Microscope,
  TestTube,
  Package,
  ListTree,
  Boxes,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  ListChecks,
  CheckCheck,
  PauseCircle,
  Home,
} from "lucide-react";
import DashboardClientComponent from "@/app/dashboard-client";
import { getAntibiotics } from "@/services/antibioticServicio";
import { getConvenios } from "@/services/convenioServicio";
import { getCultures } from "@/services/cultureServicio";
import { getPatients } from "@/services/patientServicio";
import { getStudies } from "@/services/studyServicio";


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
      className="lucide lucide-handshake h-10 w-10 text-primary"
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


const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/' },
    { icon: Pill, label: 'Antibióticos', href: '/antibioticos' },
    { icon: ListTree, label: 'Categorías', href: '/categorias' },
    { icon: ShoppingCart, label: 'Compras', href: '/compras' },
    { icon: HandshakeIcon, label: 'Convenios', href: '/convenios' },
    { icon: Calculator, label: 'Corte de Caja', href: '/corte-caja' },
    { icon: Newspaper, label: 'Cotizaciones', href: '/cotizaciones' },
    { icon: CreditCard, label: 'Cuentas por Cobrar', href: '/cuentas-por-cobrar' },
    { icon: TestTube, label: 'Cultivos', href: '/cultivos' },
    { icon: PlusSquare, label: 'Doctores', href: '/doctores' },
    { icon: UserCheck, label: 'Empleados', href: '/empleados' },
    { icon: Microscope, label: 'Estudios', href: '/estudios' },
    { icon: FileText, label: 'Facturación', href: '/facturacion' },
    { icon: BadgePercent, label: 'Gastos', href: '/gastos' },
    { icon: FileDown, label: 'Gestión de Calidad', href: '/' },
    { icon: BarChart, label: 'Informes', href: '/' },
    { icon: Landmark, label: 'Ingresos y Egresos', href: '/ingresos-y-egresos' },
    { icon: ClipboardList, label: 'Lista de Precios', href: '/listas-de-precios' },
    { icon: NotebookTabs, label: 'Notas de Crédito', href: '/notas-de-credito' },
    { icon: ClipboardList, label: 'Opciones de Cultivos', href: '/cultivos/opciones' },
    { icon: Users, label: 'Pacientes', href: '/pacientes' },
    { icon: Package, label: 'Paquetes', href: '/paquetes' },
    { icon: FileKey, label: 'Permisos', href: '/' },
    { icon: Boxes, label: 'Productos', href: '/productos' },
    { icon: User, label: 'Proveedores', href: '/proveedores' },
    { icon: Printer, label: 'Entrega de Resultados', href: '/reporte-resultados' },
    { icon: Settings, label: 'Configuraciones', href: '/configuraciones' },
    { icon: FlaskConical, label: 'Solicitud de Examenes', href: '/solicitud-examenes' },
    { icon: Building, label: 'Sucursales', href: '/sucursales' },
].sort((a, b) => a.label.localeCompare(b.label));

const dashboardItem = menuItems.find(item => item.label === 'Dashboard');
const otherItems = menuItems.filter(item => item.label !== 'Dashboard');
const sortedMenuItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;

const StatCard = ({ icon: Icon, value, label, link, colorClass }: { icon: React.ElementType, value: string, label: string, link: string, colorClass: string }) => (
    <Card className={`text-white ${colorClass}`}>
        <CardContent className="flex items-center justify-between p-4">
            <div>
                <p className="text-3xl font-bold">{value}</p>
                <p>{label}</p>
            </div>
            <Icon className="h-12 w-12 opacity-50" />
        </CardContent>
        <div className="bg-black bg-opacity-10 p-2 text-center text-sm">
            <Link href={link} className="flex items-center justify-center gap-1">
                Más información <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    </Card>
);

const InfoCard = ({ icon: Icon, title, value, colorClass }: { icon: React.ElementType, title: string, value: string, colorClass: string }) => (
    <Card className={`${colorClass} text-white`}>
        <CardContent className="p-4 flex items-center gap-4">
            <Icon className="h-8 w-8" />
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
)

const ListCard = ({ icon: Icon, title, value, colorClass }: { icon: React.ElementType, title: string, value: string, colorClass: string }) => (
    <Card className={`${colorClass} text-white`}>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Icon className="h-8 w-8" />
                <p className="font-semibold">{title}</p>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </CardContent>
    </Card>
);


export default async function HomePage() {
    const [estudios, cultures, antibiotics, patients, convenios] = await Promise.all([
        getStudies(),
        getCultures(),
        getAntibiotics(),
        getPatients(),
        getConvenios(),
    ]);

    const stats = {
        estudios: estudios.length,
        cultures: cultures.length,
        antibiotics: antibiotics.length,
        patients: patients.length,
        convenios: convenios.length,
    };

  return (
    <div className="flex flex-col gap-6 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <LayoutGrid className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                <Link href="/public" className="hover:text-primary">Hogar</Link> / Dashboard
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Acceso Rápido a Módulos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                    {sortedMenuItems.map(({ href, icon: Icon, label }) => (
                        <Link href={href} key={label} className="flex flex-col items-center justify-center gap-2 group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-primary/10 group-hover:shadow-lg transition-all duration-200">
                                {label === 'Convenios' ? <HandshakeIcon /> : <Icon className="h-10 w-10 text-primary" />}
                            </div>
                            <p className="font-semibold text-sm text-center">{label}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard icon={Microscope} value={stats.estudios.toString()} label="Pruebas" link="/estudios" colorClass="bg-teal-500" />
            <StatCard icon={TestTube} value={stats.cultures.toString()} label="Cultivos" link="/cultivos" colorClass="bg-teal-500" />
            <StatCard icon={Pill} value={stats.antibiotics.toString()} label="Antibióticos" link="/antibioticos" colorClass="bg-teal-500" />
            <StatCard icon={Users} value={stats.patients.toString()} label="Pacientes" link="/pacientes" colorClass="bg-teal-500" />
            <StatCard icon={FileText} value={stats.convenios.toString()} label="Contratos" link="/convenios" colorClass="bg-teal-500" />
            <StatCard icon={Home} value="0" label="Visitas domiciliarias" link="/" colorClass="bg-teal-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard icon={DollarSign} title="Cantidad de ingresos de hoy" value="0 MXN" colorClass="bg-green-500" />
            <InfoCard icon={DollarSign} title="Monto del gasto de hoy" value="0 MXN" colorClass="bg-green-500" />
            <InfoCard icon={DollarSign} title="Importe de beneficio de hoy" value="0 MXN" colorClass="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
                <ListCard icon={ListChecks} title="Pruebas" value={stats.estudios.toString()} colorClass="bg-primary" />
                <ListCard icon={ListChecks} title="Cultivos" value={stats.cultures.toString()} colorClass="bg-primary" />
            </div>
            <div className="space-y-4">
                <ListCard icon={PauseCircle} title="Pruebas pendientes" value="0" colorClass="bg-yellow-500" />
                <ListCard icon={PauseCircle} title="Cultivos pendientes" value="0" colorClass="bg-yellow-500" />
            </div>
            <div className="space-y-4">
                <ListCard icon={CheckCheck} title="Pruebas completadas" value="0" colorClass="bg-green-600" />
                <ListCard icon={CheckCheck} title="Cultivos completadas" value="0" colorClass="bg-green-600" />
            </div>
        </div>

        <DashboardClientComponent />
    </div>
  );
}
