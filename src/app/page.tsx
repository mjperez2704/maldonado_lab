
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"; // Importamos el componente de progreso
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula la carga durante 5 segundos
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // Ajusta la velocidad si es necesario
      });
    }, 45); // Se actualiza cada 45ms para llegar a 100 en ~5s

    // Navega al login después de 5 segundos
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 5000);

    // Limpieza al desmontar el componente
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);


  return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8">
        <div className="w-64 h-64 relative">
          <Image
              src="/logo_lims.png"
              alt="Cargando MEGA LIMS"
              layout="fill"
              objectFit="contain"
              priority
          />
        </div>

        {/* Barra de Progreso */}
        <div className="w-full max-w-md">
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2 text-primary font-semibold">CARGANDO   MEGA - LIMS...</p>
        </div>
      </div>
  );
}
