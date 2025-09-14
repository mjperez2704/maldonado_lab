
"use client";

import { ReactNode, useEffect } from "react";

// Este componente se encarga de aplicar y limpiar los estilos
// específicos para la página de impresión en el body.
function PrintBodyStyler() {
  useEffect(() => {
    // Clases originales que queremos quitar para la impresión
    const originalClasses = ["font-body", "antialiased", "flex", "flex-col", "min-h-screen", "bg-background"];
    
    // Al montar el componente, quitamos las clases del layout principal y ponemos la de impresión
    document.body.classList.remove(...originalClasses);
    document.body.classList.add("bg-white");

    // Al desmontar el componente (al salir de la página de impresión),
    // restauramos las clases originales.
    return () => {
      document.body.classList.remove("bg-white");
      document.body.classList.add(...originalClasses);
    };
  }, []);

  return null; // Este componente no renderiza nada visible
}


export default function PrintLayout({ children }: { children: ReactNode; }) {
    // El layout ya no contiene <html> ni <body>.
    // Es un fragmento que renderiza los hijos y el componente que maneja los estilos.
    return (
        <>
            <PrintBodyStyler />
            {children}
        </>
    );
}
