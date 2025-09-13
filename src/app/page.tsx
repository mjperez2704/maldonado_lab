
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"; // Importamos el componente de progreso

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

  // **IMPORTANTE**: Coloca tu video o gif en la carpeta `public`
  const mediaFile = '/splash-video.mp4'; // <- Cambia esto por el nombre de tu archivo
  const isVideo = mediaFile.endsWith('.mp4');

  return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8">
        {/*<div className="w-full max-w-md h-auto">*/}
        <div className="w-full h-full">
          {/* Espacio para tu video o GIF */}
          {isVideo ? (
              <video
                  src={mediaFile}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-lg shadow-lg"
              >
                Tu navegador no soporta videos.
              </video>
          ) : (
              <img
                  src={mediaFile} // Si es un GIF
                  alt="Cargando..."
                  className="w-full h-full object-cover rounded-lg shadow-lg"
              />
          )}
        </div>

        {/* Barra de Progreso */}
        <div className="w-full max-w-md">
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2 text-primary font-semibold">C A R G A N D O   M E G A - S Y S T E M...</p>
        </div>
      </div>
  );
}
