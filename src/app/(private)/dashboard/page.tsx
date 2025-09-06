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

// Importar el nuevo servicio del dashboard
import { getDashboardStats, getTodayFinancialSummary, getOperationalStatus } from "@/services/dashboardService";

const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: FlaskConical, label: 'Solicitud de Examenes', href: '/solicitud-examenes' },
    { icon: Printer, label: 'Entrega de Resultados', href: '/reporte-resultados' },
    { icon: Users, label: 'Pacientes', href: '/pacientes' },
    { icon: PlusSquare, label: 'Doctores', href: '/doctores' },
    { icon: Microscope, label: 'Estudios', href: '/estudios' },
    { icon: ListTree, label: 'Categorías', href: '/categorias' },
    { icon: Boxes, label: 'Productos', href: '/productos' },
    { icon: ShoppingCart, label: 'Compras', href: '/compras' },
    { icon: BadgePercent, label: 'Gastos', href: '/gastos' },
    { icon: Landmark, label: 'Ingresos y Egresos', href: '/ingresos-y-egresos' },
    { icon: Calculator, label: 'Corte de Caja', href: '/corte-caja' },
    { icon: Newspaper, label: 'Cotizaciones', href: '/cotizaciones' },
    { icon: Building, label: 'Sucursales', href: '/sucursales' },
    { icon: User, label: 'Proveedores', href: '/proveedores' },
    { icon: UserCheck, label: 'Empleados', href: '/empleados' },
    { icon: Settings, label: 'Configuraciones', href: '/configuraciones' },
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

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

export default async function HomePage() {
    // Llamadas al nuevo servicio optimizado
    const [stats, financialSummary, operationalStatus] = await Promise.all([
        getDashboardStats(),
        getTodayFinancialSummary(),
        getOperationalStatus(),
    ]);

  return (
    <div className="flex flex-col gap-6 py-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <LayoutGrid className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Hogar</Link> / Dashboard
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
                                <Icon className="h-10 w-10 text-primary" />
                            </div>
                            <p className="font-semibold text-sm text-center">{label}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Statistics Section - Datos Reales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Users} value={stats.patientsCount.toString()} label="Pacientes" link="/pacientes" colorClass="bg-blue-500" />
            <StatCard icon={Microscope} value={stats.servicesCount.toString()} label="Servicios" link="/estudios" colorClass="bg-teal-500" />
            <StatCard icon={PlusSquare} value={stats.doctorsCount.toString()} label="Doctores" link="/doctores" colorClass="bg-purple-500" />
            <StatCard icon={User} value={stats.providersCount.toString()} label="Proveedores" link="/proveedores" colorClass="bg-orange-500" />
        </div>

        {/* Financial Summary - Datos Reales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard icon={DollarSign} title="Ingresos de Hoy" value={formatCurrency(financialSummary.totalIncome)} colorClass="bg-green-600" />
            <InfoCard icon={DollarSign} title="Egresos de Hoy" value={formatCurrency(financialSummary.totalExpenses)} colorClass="bg-red-600" />
            <InfoCard icon={DollarSign} title="Balance de Hoy" value={formatCurrency(financialSummary.balance)} colorClass="bg-sky-600" />
        </div>

        {/* Operational Status - Datos Reales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
                <ListCard icon={PauseCircle} title="Solicitudes Pendientes" value={operationalStatus.pending.toString()} colorClass="bg-yellow-500" />
            </div>
            <div className="space-y-4">
                <ListCard icon={ClipboardList} title="Solicitudes en Proceso" value={operationalStatus.in_process.toString()} colorClass="bg-blue-500" />
            </div>
            <div className="space-y-4">
                <ListCard icon={CheckCheck} title="Solicitudes Completadas" value={operationalStatus.completed.toString()} colorClass="bg-green-600" />
            </div>
        </div>
    </div>
  );
}
