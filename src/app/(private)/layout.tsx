'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Footer } from '@/components/layout/Footer';

export default function PrivateLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
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
    );
}
