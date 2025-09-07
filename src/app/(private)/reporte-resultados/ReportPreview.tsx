
"use client";

import { Recibo } from "@/services/reciboService";
import { Patient, getPatientById } from "@/services/patientService";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ReportPreviewProps {
    recibo: Recibo;
}

export default function ReportPreview({ reciboId }: { reciboId: string }) {
    const [recibo, setRecibo] = useState<Recibo | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Asumimos que getReciboById ya existe
                const reciboPromise = fetch(`/api/recibos/${reciboId}`).then(res => res.json());
                const reciboData = await reciboPromise;
                
                if (reciboData) {
                    setRecibo(reciboData);
                    if (reciboData.patientCode) {
                        const patientPromise = fetch(`/api/patients/${reciboData.patientCode}`).then(res => res.json());
                        const patientData = await patientPromise;
                        setPatient(patientData);
                    }
                }
            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reciboId]);
    
    // In a real scenario, you would fetch the patient data as well.
    // For now, we will use the data available in the recibo.
    if (loading || !recibo) {
        return <div className="p-10 text-center">Cargando reporte...</div>
    }

    return (
        <div className="bg-white text-black p-8 font-sans text-sm">
            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-black pb-4">
                <div className="flex items-center gap-4">
                    <Image src="https://maldonado.mega-spots-test.shop/storage/images/logo-maldonado.png" alt="Logo" width={80} height={80} data-ai-hint="logo" />
                    <div>
                        <h1 className="font-bold text-2xl">LABORATORIOS MALDONADO</h1>
                        <p>Unidad Matriz</p>
                        <p>Av. De las Rosas 21, Col. Jardines, C.P. 50000</p>
                        <p>Tel: (722) 123-4567, (722) 987-6543</p>
                    </div>
                </div>
                <div className="text-right">
                    <p>Folio: <span className="font-bold">{recibo.barcode}</span></p>
                    <p>Fecha de Impresión: {new Date().toLocaleString()}</p>
                </div>
            </header>

            {/* Patient Info */}
            <section className="my-6 border-b border-black pb-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <p><strong>Paciente:</strong> {recibo.patientName}</p>
                    <p><strong>Edad:</strong> {patient?.age || 'N/A'}</p>
                    <p><strong>Médico:</strong> {recibo.doctor || 'A QUIEN CORRESPONDA'}</p>
                    <p><strong>Sexo:</strong> {patient?.gender || 'N/A'}</p>
                    <p><strong>Fecha de Solicitud:</strong> {new Date(recibo.date).toLocaleDateString()}</p>
                    <p><strong>Fecha de Entrega:</strong> {recibo.deliveryDate ? new Date(recibo.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
            </section>

            {/* Results Table */}
            <section>
                <h2 className="text-center font-bold text-lg mb-4">RESULTADOS DE LABORATORIO</h2>
                <table className="w-full">
                    <thead className="border-b-2 border-black">
                        <tr>
                            <th className="text-left py-2 px-2">Estudio / Parámetro</th>
                            <th className="text-left py-2 px-2">Resultado</th>
                            <th className="text-left py-2 px-2">Unidades</th>
                            <th className="text-left py-2 px-2">Valores de Referencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recibo.results?.map((res, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="py-2 px-2 font-medium">{res.parameterName ? <span className="pl-4">{res.parameterName}</span> : <strong>{res.studyName}</strong>}</td>
                                <td className="py-2 px-2 font-bold">{res.result}</td>
                                <td className="py-2 px-2">{res.unit}</td>
                                <td className="py-2 px-2">{res.reference}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            {/* Footer */}
            <footer className="mt-8 pt-4 border-t-2 border-black flex justify-between items-end">
                <div>
                     <p className="text-xs">Los valores de referencia pueden variar entre laboratorios.</p>
                     <p className="text-xs">Este reporte no es válido sin la firma del personal autorizado.</p>
                </div>
                 <div className="text-center">
                    <p className="border-t border-gray-500 pt-2 mt-8 px-8">Q.F.B. Juan Pérez</p>
                    <p className="text-xs">Responsable Sanitario</p>
                    <p className="text-xs">Céd. Prof. 1234567</p>
                </div>
            </footer>
        </div>
    );
}

// Necesitarás crear estas APIs
// src/app/api/recibos/[id]/route.ts
// src/app/api/patients/[id]/route.ts
