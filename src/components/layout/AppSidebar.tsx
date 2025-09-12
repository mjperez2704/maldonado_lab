
"use client";
import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
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

const menuGroups = [
    {
        items: [
            { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
        ]
    },
    {
        groupLabel: 'Operaciones',
        items: [
            { icon: FlaskConical, label: 'Solicitud de Examenes', href: '/solicitud-examenes' },
            { icon: Printer, label: 'Entrega de Resultados', href: '/reporte-resultados' },
            { icon: Newspaper, label: 'Cotizaciones', href: '/cotizaciones' },
        ]
    },
    {
        groupLabel: 'Catálogos',
        items: [
            { icon: Microscope, label: 'Estudios', href: '/estudios' },
            { icon: TestTube, label: 'Cultivos', href: '/cultivos' },
            { icon: ClipboardList, label: 'Opciones de Cultivos', href: '/cultivos/opciones' },
            { icon: Package, label: 'Paquetes', href: '/paquetes' },
            { icon: ListTree, label: 'Categorías', href: '/categorias' },
            { icon: Pill, label: 'Antibióticos', href: '/antibioticos' },
            { icon: Boxes, label: 'Productos', href: '/productos' },
        ]
    },
    {
        groupLabel: 'Administración',
        items: [
            { icon: Users, label: 'Pacientes', href: '/pacientes' },
            { icon: PlusSquare, label: 'Doctores', href: '/doctores' },
            { icon: User, label: 'Proveedores', href: '/proveedores' },
            { icon: HandshakeIcon, label: 'Convenios', href: '/convenios' },
            { icon: UserCheck, label: 'Empleados', href: '/empleados' },
            { icon: Building, label: 'Sucursales', href: '/sucursales' },
        ]
    },
    {
        groupLabel: 'Finanzas',
        items: [
            { icon: Calculator, label: 'Corte de Caja', href: '/corte-caja' },
            { icon: Landmark, label: 'Ingresos y Egresos', href: '/ingresos-y-egresos' },
            { icon: CreditCard, label: 'Cuentas por Cobrar', href: '/cuentas-por-cobrar' },
            { icon: NotebookTabs, label: 'Notas de Crédito', href: '/notas-de-credito' },
            { icon: FileText, label: 'Facturación', href: '/facturacion' },
            { icon: BadgePercent, label: 'Gastos', href: '/gastos' },
            { icon: ShoppingCart, label: 'Compras', href: '/compras' },
            { icon: ClipboardList, label: 'Lista de Precios', href: '/listas-de-precios' },
        ]
    },
    {
        groupLabel: 'Sistema',
        items: [
            { icon: BarChart, label: 'Informes', href: '/informes' },
            { icon: FileDown, label: 'Gestión de Calidad', href: '#' },
            { icon: FileKey, label: 'Permisos', href: '#' },
            { icon: Settings, label: 'Configuraciones', href: '/configuraciones' },
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
            {menuGroups.flatMap((group, index) => {
              const groupContent = [];

              if (index > 0) {
                groupContent.push(
                  <li key={`${group.groupLabel || index}-separator`} aria-hidden="true">
                    <SidebarSeparator className="my-1" />
                  </li>
                );
              }

              if (group.groupLabel) {
                groupContent.push(
                  <li key={group.groupLabel} className="px-3 pt-2 pb-1 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                    {group.groupLabel}
                  </li>
                );
              }

              group.items.forEach(item => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href 
                  : item.href !== '#' && pathname.startsWith(item.href);
                
                groupContent.push(
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
                );
              });

              return groupContent;
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
