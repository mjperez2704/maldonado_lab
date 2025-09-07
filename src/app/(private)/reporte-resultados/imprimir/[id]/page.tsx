
"use client";

import ReportPreview from "../../ReportPreview";
import { useParams } from "next/navigation";

export default function PrintReportPage() {
    const params = useParams();
    const reciboId = params.id as string;

    // The layout for this page is handled by layout.tsx in the same directory
    return (
        <>
            {reciboId ? <ReportPreview reciboId={reciboId} /> : <p>Cargando...</p>}
        </>
    );
}
