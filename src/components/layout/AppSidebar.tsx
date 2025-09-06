
"use client";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from 'next/link';
import {
  Users,
  FlaskConical,
  FileText,
  Printer,
  ClipboardList,
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
  Palette,
  DollarSign,
  BookUser,
  Cog,
  ShieldCheck,
  Building2,
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

export const menuGroups = [
  {
    label: "Principal",
    icon: Palette,
    items: [
        { key: 'dashboard', icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
        { key: 'solicitud-examenes', icon: FlaskConical, label: 'Solicitud de Examenes', href: '/solicitud-examenes' },
        { key: 'entrega-resultados', icon: Printer, label: 'Entrega de Resultados', href: '/entrega-resultados' },
        { key: 'facturacion', icon: FileText, label: 'Facturación', href: '/facturacion' },
    ]
  },
  {
      label: "Catálogos",
      icon: BookUser,
      items: [
          { key: 'pacientes', icon: Users, label: 'Pacientes', href: '/pacientes' },
          { key: 'doctores', icon: PlusSquare, label: 'Doctores', href: '/doctores' },
          { key: 'empleados', icon: UserCheck, label: 'Empleados', href: '/empleados' },
          { key: 'proveedores', icon: User, label: 'Proveedores', href: '/proveedores' },
          { key: 'estudios', icon: Microscope, label: 'Estudios', href: '/estudios' },
          { key: 'paquetes', icon: Package, label: 'Paquetes', href: '/paquetes' },
          { key: 'cultivos', icon: TestTube, label: 'Cultivos', href: '/cultivos' },
          { key: 'antibioticos', icon: Pill, label: 'Antibióticos', href: '/antibioticos' },
          { key: 'productos', icon: Boxes, label: 'Productos', href: '/productos' },
          { key: 'categorias', icon: ListTree, label: 'Categorías', href: '/categorias' },
      ]
  },
  {
      label: "Finanzas",
      icon: DollarSign,
      items: [
          { key: 'compras', icon: ShoppingCart, label: 'Compras', href: '/compras' },
          { key: 'gastos', icon: BadgePercent, label: 'Gastos', href: '/gastos' },
          { key: 'ingresos-y-egresos', icon: Landmark, label: 'Ingresos y Egresos', href: '/ingresos-y-egresos' },
          { key: 'corte-caja', icon: Calculator, label: 'Corte de Caja', href: '/corte-caja' },
          { key: 'cuentas-por-cobrar', icon: CreditCard, label: 'Cuentas por Cobrar', href: '/cuentas-por-cobrar' },
          { key: 'notas-de-credito', icon: NotebookTabs, label: 'Notas de Crédito', href: '/notas-de-credito' },
          { key: 'listas-de-precios', icon: ClipboardList, label: 'Lista de Precios', href: '/listas-de-precios' },
          { key: 'convenios', icon: HandshakeIcon, label: 'Convenios', href: '/convenios' },
          { key: 'cotizaciones', icon: Newspaper, label: 'Cotizaciones', href: '/cotizaciones' },
      ]
  },
  {
      label: "Administración",
      icon: Cog,
      items: [
          { key: 'configuraciones', icon: Settings, label: 'Configuraciones', href: '/configuraciones' },
          { key: 'permisos', icon: FileKey, label: 'Permisos', href: '/permisos' },
          { key: 'sucursales', icon: Building, label: 'Sucursales', href: '/sucursales' },
          { key: 'gestion-calidad', icon: FileDown, label: 'Gestión de Calidad', href: '#' },
          { key: 'informes', icon: BarChart, label: 'Informes', href: '#' },
          { key: 'opciones-cultivos', icon: ClipboardList, label: 'Opciones de Cultivos', href: '/cultivos/opciones' },
      ]
  }
];


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
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="flex items-center gap-2">
                    <group.icon className="h-5 w-5"/>
                    {group.label}
                </SidebarGroupLabel>
                {group.items.map((item) => {
                  const isActive = item.href !== '/' && item.href !== '#' && pathname.startsWith(item.href);
                  
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
              </SidebarGroup>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
