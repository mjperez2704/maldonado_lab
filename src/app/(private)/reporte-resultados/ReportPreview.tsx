
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
            if (!reciboId) {
                setLoading(false);
                return;
            }
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
    
    if (loading || !recibo) {
        return <div className="p-10 text-center text-black">Cargando reporte...</div>
    }

    // Group results by study
    const groupedResults: { [key: string]: Recibo['results'] } = (recibo.results || []).reduce((acc, result) => {
        if (!acc[result.studyName]) {
            acc[result.studyName] = [];
        }
        acc[result.studyName]?.push(result);
        return acc;
    }, {} as { [key: string]: Recibo['results'] });


    return (
        <div className="bg-white text-black p-8 font-sans text-xs">
            {/* Header */}
            <header className="flex justify-between items-start border-b-2 border-black pb-4">
                <div className="flex items-center gap-4">
                    <Image src="/logo_lims.png" alt="Logo MEGA LIMS" width={200} height={50} data-ai-hint="logo"/>
                </div>
                <div className="text-right">
                    <h1 className="font-bold text-lg">MEGA LIMS</h1>
                    <p>Unidad Matriz</p>
                    <p>Dirección: José Martí No.229</p>
                    <p>Col. Centro C.P. 59033 Sahuayo, Michoacán</p>
                </div>
            </header>

            {/* Patient Info */}
            <section className="my-4 pb-2 text-xs">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 p-2 border border-black rounded-md">
                    <div>
                        <p><strong>Paciente:</strong> {recibo.patientName?.toUpperCase()}</p>
                        <p><strong>Edad:</strong> {patient?.age} {patient?.ageUnit}</p>
                        <p><strong>Sexo:</strong> {patient?.gender?.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>No. de Solicitud:</strong> {recibo.barcode}</p>
                        <p><strong>Fecha de Solicitud:</strong> {new Date(recibo.date).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p><strong>Fecha de Impresión:</strong> {new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                     <div className="col-span-2">
                        <p><strong>Dirigido:</strong> A QUIEN CORRESPONDA</p>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="space-y-4">
                {Object.entries(groupedResults).map(([studyName, results], studyIndex) => (
                    <div key={studyIndex}>
                        <h2 className="bg-gray-200 text-center font-bold text-sm mb-2 p-1">{studyName}</h2>
                        <table className="w-full text-xs">
                            <thead className="border-b-2 border-black">
                                <tr>
                                    <th className="text-left py-1 px-2 font-bold">Parámetro</th>
                                    <th className="text-center py-1 px-2 font-bold">Resultado</th>
                                    <th className="text-center py-1 px-2 font-bold">UM</th>
                                    <th className="text-left py-1 px-2 font-bold">Intervalo Biológico de Referencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results?.map((res, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="py-1 px-2">{res.parameterName || studyName}</td>
                                        <td className="py-1 px-2 text-center font-bold">{res.result}</td>
                                        <td className="py-1 px-2 text-center">{res.unit}</td>
                                        <td className="py-1 px-2">{res.reference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between text-gray-500 mt-1 text-[10px] px-2">
                            <span>Metodología: N/A</span>
                             <span>Fecha y Hora de Liberación: {recibo.deliveryDate ? new Date(recibo.deliveryDate).toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                ))}
            </section>
            
            {/* Footer */}
            <footer className="mt-8 pt-4 border-t-2 border-black flex justify-between items-end text-[10px]">
                <div className="space-y-1">
                    <p className="font-bold">Token: {`AVGES2D${recibo.id}`}</p>
                    <p className="max-w-md">POR POLÍTICAS DEL LABORATORIO, NO SE EMITIRAN DIAGNÓSTICOS DE LOS RESULTADOS AQUÍ REALIZADOS, ESTOS DEBERÁN SER EVALUADOS POR SU MÉDICO ENCONJUNTO CON SU HISTORIAL CLÍNICO.</p>
                    <p><strong>RESPONSABLE SANITARIO:</strong> Q.F.B Miguel Ángel Dominguez Simi CED.PROF. 13200092</p>
                </div>
                 <div className="text-center">
                    <div className="h-16 w-48">
                         {/* Espacio para la firma */}
                    </div>
                    <p className="border-t border-gray-500 pt-1 mt-2 px-8 font-bold">Q.F.B. Francisco Maldonado</p>
                    <p>Aviso de Funcionamiento: 03009-2020</p>
                </div>
            </footer>
        </div>
    );
}
