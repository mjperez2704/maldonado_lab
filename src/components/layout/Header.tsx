
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, TestTubeDiagonal, LogOut } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    // Mock logout logic
    router.push('/login');
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <SidebarTrigger className="text-primary-foreground" />
          <h1 className="text-xl font-bold tracking-wider hidden sm:block">
            Panel de Control - MEGA LIMS
          </h1>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="hover:bg-primary/80">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
