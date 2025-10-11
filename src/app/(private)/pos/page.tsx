'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ShoppingCart, User, CreditCard, Printer, Trash2, Plus, Minus, Receipt as ReceiptIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt } from "@/components/Receipt";
import './pos-styles.css';

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

const mockProducts: Product[] = [
  { id: '1', name: 'Hemograma Completo', price: 150.00, category: 'Hematología', description: 'Análisis completo de sangre', stock: 100 },
  { id: '2', name: 'Perfil Lipídico', price: 200.00, category: 'Bioquímica', description: 'Colesterol y triglicéridos', stock: 100 },
  { id: '3', name: 'Glucosa en Sangre', price: 80.00, category: 'Bioquímica', description: 'Nivel de glucosa', stock: 100 },
  { id: '4', name: 'Examen General de Orina', price: 120.00, category: 'Urología', description: 'Análisis completo de orina', stock: 100 },
  { id: '5', name: 'TSH', price: 180.00, category: 'Endocrinología', description: 'Hormona estimulante del tiroides', stock: 100 },
  { id: '6', name: 'PSA', price: 220.00, category: 'Urología', description: 'Antígeno prostático específico', stock: 100 },
  { id: '7', name: 'Cultivo de Orina', price: 250.00, category: 'Microbiología', description: 'Cultivo y antibiograma', stock: 100 },
  { id: '8', name: 'Radiografía de Tórax', price: 300.00, category: 'Imagenología', description: 'Rayos X del tórax', stock: 100 },
];

const mockCustomers: Customer[] = [
  { id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '555-0101' },
  { id: '2', name: 'María González', email: 'maria@email.com', phone: '555-0102' },
  { id: '3', name: 'Carlos López', email: 'carlos@email.com', phone: '555-0103' },
];

export default function POSScreen() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [lastTransaction, setLastTransaction] = useState<{
    cart: CartItem[];
    customer: Customer | null;
    paymentMethod: string;
    receiptNumber: string;
  } | null>(null);

  const categories = ['Todos', ...Array.from(new Set(mockProducts.map(p => p.category)))];
  
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = () => {
    if (!paymentMethod || cart.length === 0) return;
    
    const receiptNumber = `RCP-${Date.now()}`;
    const transaction = {
      cart: [...cart],
      customer: selectedCustomer,
      paymentMethod,
      receiptNumber
    };
    
    setLastTransaction(transaction);
    setShowReceipt(true);
    setCart([]);
    setSelectedCustomer(null);
    setShowPayment(false);
    setPaymentMethod('');
  };

  return (
    <div className="h-screen flex flex-col bg-background p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      {/* Header */}
      <div className="pos-header flex items-center justify-between">
        <h1 className="pos-header-title text-2xl md:text-3xl font-bold text-primary">POS - Sistema de Ventas</h1>
        <div className="pos-header-badges flex items-center gap-2 md:gap-4">
          <Badge variant="outline" className="text-sm md:text-lg px-2 md:px-4 py-1 md:py-2 pos-touch-target">
            <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
            {getTotalItems()} artículos
          </Badge>
          <Badge variant="secondary" className="text-sm md:text-lg px-2 md:px-4 py-1 md:py-2 pos-touch-target">
            Total: ${getTotalAmount().toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="pos-layout flex flex-1 gap-3 md:gap-6 min-h-0">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col">
          {/* Search and Filters */}
          <Card className="mb-2 md:mb-4">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 md:w-5 h-4 md:h-5" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pos-search-input pl-10 text-base md:text-lg h-10 md:h-12 pos-touch-target"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="pos-category-select w-full md:w-64 h-10 md:h-12 text-base md:text-lg pos-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-base md:text-lg pos-touch-target">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card className="flex-1 min-h-0">
            <CardContent className="p-2 md:p-4 h-full">
              <ScrollArea className="pos-scroll-area h-full">
                <div className="pos-product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                  {filteredProducts.map(product => (
                    <Card 
                      key={product.id} 
                      className="pos-product-card"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-2 md:p-4">
                        <div className="space-y-1 md:space-y-2">
                          <h3 className="font-semibold text-sm md:text-lg line-clamp-2">{product.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          <div className="flex justify-between items-center">
                            <span className="text-lg md:text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                            <Button size="sm" className="pos-touch-button h-8 w-8 md:h-10 md:w-10 rounded-full">
                              <Plus className="w-3 md:w-4 h-3 md:h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart and Checkout */}
        <div className="pos-cart-panel w-full md:w-96 flex flex-col">
          {/* Customer Selection */}
          <Card className="mb-2 md:mb-4">
            <CardHeader className="pb-2 md:pb-3 p-2 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center">
                <User className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-2 md:p-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="pos-customer-button w-full h-10 md:h-12 text-left justify-start text-base md:text-lg pos-touch-target"
                  >
                    {selectedCustomer ? selectedCustomer.name : "Seleccionar cliente"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm md:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Seleccionar Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {mockCustomers.map(customer => (
                      <Button
                        key={customer.id}
                        variant="ghost"
                        className="pos-customer-button w-full justify-start h-auto p-3 md:p-4 pos-touch-target"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-sm md:text-base">{customer.name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{customer.email}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card className="flex-1 min-h-0">
            <CardHeader className="pb-2 md:pb-3 p-2 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                  Carrito
                </span>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart([])}
                    className="pos-touch-button text-destructive hover:text-destructive pos-touch-target"
                  >
                    <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0 p-2 md:p-6">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2" />
                    <p className="text-sm md:text-base">Carrito vacío</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="pos-scroll-area h-full">
                  <div className="space-y-2 md:space-y-3">
                    {cart.map(item => (
                      <Card key={item.product.id} className="pos-cart-item p-2 md:p-3">
                        <div className="space-y-1 md:space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-xs md:text-sm line-clamp-2 flex-1">{item.product.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id)}
                              className="pos-touch-button text-destructive hover:text-destructive h-6 w-6 p-0 ml-2 pos-touch-target"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary text-sm md:text-base">${item.product.price.toFixed(2)}</span>
                            <div className="flex items-center gap-1 md:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="pos-quantity-button h-6 md:h-8 w-6 md:w-8 p-0 pos-touch-target"
                              >
                                <Minus className="w-2 md:w-3 h-2 md:h-3" />
                              </Button>
                              <span className="w-6 md:w-8 text-center font-semibold text-xs md:text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="pos-quantity-button h-6 md:h-8 w-6 md:w-8 p-0 pos-touch-target"
                              >
                                <Plus className="w-2 md:w-3 h-2 md:h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs md:text-sm">Subtotal: ${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Checkout */}
          {cart.length > 0 && (
            <Card className="mt-2 md:mt-4">
              <CardContent className="p-2 md:p-4">
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center text-lg md:text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${getTotalAmount().toFixed(2)}</span>
                  </div>
                  
                  <Dialog open={showPayment} onOpenChange={setShowPayment}>
                    <DialogTrigger asChild>
                      <Button className="pos-checkout-button w-full h-12 md:h-14 text-base md:text-lg pos-touch-target" disabled={cart.length === 0}>
                        <CreditCard className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                        Proceder al Pago
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm md:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Procesar Pago</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Método de Pago</label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="pos-touch-target h-10 md:h-12">
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="efectivo" className="pos-touch-target">Efectivo</SelectItem>
                              <SelectItem value="tarjeta" className="pos-touch-target">Tarjeta de Crédito/Débito</SelectItem>
                              <SelectItem value="transferencia" className="pos-touch-target">Transferencia Bancaria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm md:text-base">
                            <span>Subtotal:</span>
                            <span>${getTotalAmount().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm md:text-base">
                            <span>IVA (16%):</span>
                            <span>${(getTotalAmount() * 0.16).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base md:text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${(getTotalAmount() * 1.16).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 pos-payment-button pos-touch-target h-10 md:h-12"
                            onClick={() => setShowPayment(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            className="flex-1 pos-payment-button pos-touch-target h-10 md:h-12"
                            onClick={handlePayment}
                            disabled={!paymentMethod}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Pagar e Imprimir
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ReceiptIcon className="w-5 h-5 mr-2" />
              Recibo de Pago
            </DialogTitle>
          </DialogHeader>
          {lastTransaction && (
            <>
              <Receipt 
                cart={lastTransaction.cart}
                customer={lastTransaction.customer}
                paymentMethod={lastTransaction.paymentMethod}
                receiptNumber={lastTransaction.receiptNumber}
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowReceipt(false)}
                >
                  Cerrar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}