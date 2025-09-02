'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LoaderProvider } from '@/hooks/useLoader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicRoute = ['/login', '/'].includes(pathname) || pathname.startsWith('/splash');

  return (
      <html lang="es" suppressHydrationWarning>
      <head>
        <title>Panel de Control - Maldonado Labs</title>
        <meta name="description" content="Sistema de Gestión de Laboratorio" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <LoaderProvider>
          {isPublicRoute ? (
            children
          ) : (
            <SidebarProvider>
              <div className="flex flex-1">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <Header />
                  <main className="flex-grow container mx-auto px-4">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
            </SidebarProvider>
          )}
        </LoaderProvider>
      <Toaster />
      </body>
      </html>
  );
}
