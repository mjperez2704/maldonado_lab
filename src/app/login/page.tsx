
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { login } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@megaspots.com');
  const [password, setPassword] = useState('supersecretpassword');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login({ email, password });

      if (user && user.name && user.position) {
        // --- Manejo de Sesión y Permisos (Básico) ---
        // NOTA: Esto es para desarrollo. En producción se usan cookies seguras (httpOnly).
        sessionStorage.setItem('userData', JSON.stringify({
          name: user.name,
          role: user.position // Guardamos el rol (puesto)
        }));

        toast({
          title: "Inicio de Sesión Exitoso",
          description: `Bienvenido, ${user.name}.`,
        });

        // Redirigimos al nuevo dashboard
        router.push('/dashboard');

      } else {
        toast({
          title: "Error de autenticación",
          description: "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error del servidor",
        description: "No se pudo conectar con el servidor. Intente de nuevo.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm p-6 shadow-2xl">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">Iniciar Sesión</h1>
            </div>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Usuario de Prueba</AlertTitle>
              <AlertDescription>
                Email: admin@megaspots.com <br/> Pass: supersecretpassword
              </AlertDescription>
            </Alert>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm flex justify-between">
              <span className="text-muted-foreground"></span>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Crear cuenta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

