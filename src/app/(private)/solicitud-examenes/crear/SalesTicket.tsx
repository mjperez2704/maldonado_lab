
"use client";

import Image from 'next/image';
import { ReciboCreation } from "@/services/recibosServicio";

interface SalesTicketProps {
    recibo: ReciboCreation;
    items: { nombre: string; precio: number; tipo_estudio: 'study' | 'package'}[];
}

export function SalesTicket({ recibo, items }: SalesTicketProps) {
    if (!recibo) return null;

    return (
        <div style={{ fontFamily: 'monospace', fontSize: '10px', width: '78mm', padding: '5px', color: 'black' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                {/* Logo */}
                <Image src="https://firebasestorage.googleapis.com/v0/b/app-hosting-lab.appspot.com/o/2c0f1b23820a2f7c000c2838332155e828a25c7625debe32223a5932599d141e.png?alt=media&token=c11104e7-4f65-4a25-a131-419b48c68b75" alt="Logo" width={100} height={30} style={{ margin: '0 auto' }} data-ai-hint="logo"/>
                <h2 style={{ fontWeight: 'bold', margin: '5px 0 0' }}>MEGA LIMS</h2>
                <p style={{ margin: 0, fontSize: '9px' }}>Av. De las Rosas 21, Col. Jardines, C.P. 50000</p>
                <p style={{ margin: 0, fontSize: '9px' }}>Tel: (722) 123-4567</p>
                <p style={{ margin: 0, fontSize: '9px' }}>Fecha: {new Date().toLocaleString()}</p>
            </div>
            
            <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px' }}>
                <p style={{ margin: 0 }}><strong>Paciente:</strong> {recibo.nombrePaciente}</p>
            </div>
            
            <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Descripción</span>
                    <span>Total</span>
                </div>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.nombre}</span>
                        <span>${Number(item.precio).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px', display: 'grid', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>${Number(recibo.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Descuento:</span>
                    <span>${Number(recibo.descuento).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                    <span>Total:</span>
                    <span>${Number(recibo.total).toFixed(2)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>¡Gracias por su visita!</p>
            </div>
        </div>
    );
}
