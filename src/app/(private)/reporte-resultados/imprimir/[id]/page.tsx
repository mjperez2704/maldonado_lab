
"use client";

import ReportPreview from "../../ReportPreview";
import { useParams } from "next/navigation";

export default function PrintReportPage() {
    const params = useParams();
    const reciboId = params.id as string;

    return (
        <div>
            {reciboId ? <ReportPreview reciboId={reciboId} /> : <p>Cargando...</p>}
        </div>
    );
}
