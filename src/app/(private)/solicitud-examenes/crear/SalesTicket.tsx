
"use client";

import Image from 'next/image';
import { ReciboCreation } from "@/services/reciboService";

interface SalesTicketProps {
    recibo: ReciboCreation;
    items: { name: string; price: number; type: 'study' | 'package'}[];
}

export function SalesTicket({ recibo, items }: SalesTicketProps) {
    if (!recibo) return null;

    return (
        <div style={{ fontFamily: 'monospace', fontSize: '10px', width: '78mm', padding: '5px', color: 'black' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                {/* Logo */}
                <Image src="https://maldonado.mega-spots-test.shop/storage/images/logo-maldonado.png" alt="Logo" width={100} height={30} style={{ margin: '0 auto' }} data-ai-hint="logo"/>
                <h2 style={{ fontWeight: 'bold', margin: '5px 0 0' }}>Laboratorios Maldonado</h2>
                <p style={{ margin: 0, fontSize: '9px' }}>Av. De las Rosas 21, Col. Jardines, C.P. 50000</p>
                <p style={{ margin: 0, fontSize: '9px' }}>Tel: (722) 123-4567</p>
                <p style={{ margin: 0, fontSize: '9px' }}>Fecha: {new Date().toLocaleString()}</p>
            </div>
            
            <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px' }}>
                <p style={{ margin: 0 }}><strong>Paciente:</strong> {recibo.patientName}</p>
            </div>
            
            <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Descripción</span>
                    <span>Total</span>
                </div>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name}</span>
                        <span>${Number(item.price).toFixed(2)}</span>
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
                    <span>${Number(recibo.discount).toFixed(2)}</span>
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

