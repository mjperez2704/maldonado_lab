
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LoaderProvider } from '@/hooks/useLoader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageContext';
import { ReactNode } from "react";
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = ['/login', '/'].includes(pathname) || pathname.startsWith('/splash');

  return (
    <SidebarProvider>
      <div className={cn("flex flex-1", isPublicRoute ? 'h-screen' : 'min-h-screen')}>
        <div className={cn(isPublicRoute && "hidden")}>
          <AppSidebar />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className={cn(isPublicRoute && "hidden")}>
            <Header />
          </div>
          <main className={cn("flex-grow", !isPublicRoute && "container mx-auto px-4")}>
            {children}
          </main>
          <div className={cn(isPublicRoute && "hidden")}>
            <Footer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es" suppressHydrationWarning>
      <head>
        <title>Panel de Control - MEGA LIMS</title>
        <meta name="description" content="Sistema de Gestión de Laboratorio" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900;1000&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900;1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col bg-background">
        <LanguageProvider>
          <LoaderProvider>
            <AppLayout>{children}</AppLayout>
          </LoaderProvider>
        </LanguageProvider>
      <Toaster />
      </body>
      </html>
  );
}
