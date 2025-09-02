
"use client";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from 'next/link';
import {
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
  LayoutGrid,
  ChevronDown,
  FileKey,
  NotebookTabs,
  Microscope,
  TestTube,
  Package,
  ListTree,
  Boxes,
  ShoppingCart,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

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
      className="lucide lucide-handshake"
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
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
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
    { icon: Printer, label: 'Entrega de Resultados', href: '/entrega-resultados' },
    { icon: Microscope, label: 'Estudios', href: '/estudios' },
    { icon: FileText, label: 'Facturación', href: '/facturacion' },
    { icon: BadgePercent, label: 'Gastos', href: '/gastos' },
    { icon: FileDown, label: 'Gestión de Calidad', href: '#' },
    { icon: BarChart, label: 'Informes', href: '#' },
    { icon: Landmark, label: 'Ingresos y Egresos', href: '/ingresos-y-egresos' },
    { icon: ClipboardList, label: 'Lista de Precios', href: '/listas-de-precios' },
    { icon: NotebookTabs, label: 'Notas de Crédito', href: '/notas-de-credito' },
    { icon: ClipboardList, label: 'Opciones de Cultivos', href: '/cultivos/opciones' },
    { icon: Users, label: 'Pacientes', href: '/pacientes' },
    { icon: Package, label: 'Paquetes', href: '/paquetes' },
    { icon: FileKey, label: 'Permisos', href: '#' },
    { icon: Boxes, label: 'Productos', href: '/productos' },
    { icon: User, label: 'Proveedores', href: '/proveedores' },
    { icon: FileStack, label: 'Reporte de Resultados', href: '/reporte-resultados' },
    { icon: Settings, label: 'Configuraciones', href: '/configuraciones' },
    { icon: FlaskConical, label: 'Solicitud de Examenes', href: '/solicitud-examenes' },
    { icon: Building, label: 'Sucursales', href: '/sucursales' },
].sort((a, b) => a.label.localeCompare(b.label));

// Move Dashboard to the top
const dashboardItem = menuItems.find(item => item.label === 'Dashboard');
const otherItems = menuItems.filter(item => item.label !== 'Dashboard');
const sortedMenuItems = dashboardItem ? [dashboardItem, ...otherItems] : otherItems;


export function AppSidebar() {
    const pathname = usePathname();
    
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-primary rounded-full" />
                <span className="font-bold text-lg">Laboratorio Maldonado</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm border border-gray-200">
             <span className="font-semibold">MÓDULOS</span>
             <ChevronDown/>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sortedMenuItems.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === item.href 
                : pathname.startsWith(item.href) && item.href !== '/dashboard';
              
              return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="gap-3"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
