
import { ReactNode } from "react";
import '../../../../globals.css'; // Import global styles for consistency in the report

export default function PrintLayout({ children }: { children: ReactNode; }) {
    return (
        <html lang="es">
            <head>
                <title>Imprimir Reporte</title>
                <meta name="robots" content="noindex, nofollow" />
            </head>
            <body className="bg-white">
                {children}
            </body>
        </html>
    );
}
