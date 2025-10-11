'use client';

import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ReceiptProps {
  cart: CartItem[];
  customer: Customer | null;
  paymentMethod: string;
  receiptNumber: string;
}

export function Receipt({ cart, customer, paymentMethod, receiptNumber }: ReceiptProps) {
  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="pos-receipt max-w-sm mx-auto bg-white text-black p-6 font-mono text-sm">
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="font-bold text-lg">MEGA LIMS</h1>
        <p className="text-xs">Sistema de Laboratorio</p>
        <p className="text-xs">RFC: MLM123456789</p>
        <p className="text-xs">Tel: (555) 123-4567</p>
      </div>

      <div className="border-b pb-2 mb-4">
        <p className="text-xs"><strong>Recibo #:</strong> {receiptNumber}</p>
        <p className="text-xs"><strong>Fecha:</strong> {currentDate}</p>
        {customer && (
          <div className="mt-2">
            <p className="text-xs"><strong>Cliente:</strong> {customer.name}</p>
            <p className="text-xs"><strong>Tel:</strong> {customer.phone}</p>
            <p className="text-xs"><strong>Email:</strong> {customer.email}</p>
          </div>
        )}
      </div>

      <div className="border-b pb-2 mb-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>DESCRIPCIÓN</span>
          <span>TOTAL</span>
        </div>
        {cart.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between text-xs">
              <span className="flex-1 pr-2">{item.product.name}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600">
              {item.quantity} x ${item.product.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b pb-2 mb-4 space-y-1">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>IVA (16%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b pb-2 mb-4">
        <p className="text-xs"><strong>Método de Pago:</strong> {paymentMethod}</p>
      </div>

      <div className="text-center text-xs space-y-1">
        <p>¡Gracias por su preferencia!</p>
        <p>Este recibo es válido como comprobante</p>
        <p>de pago para servicios de laboratorio</p>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>* * * COPIA CLIENTE * * *</p>
      </div>
    </div>
  );
}