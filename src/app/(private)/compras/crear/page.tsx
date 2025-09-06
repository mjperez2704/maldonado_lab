"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, ShoppingCart, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Importar las nuevas interfaces y funciones de los servicios refactorizados
import { createPurchase } from "@/services/purchaseService";
import { getProviders, Provider } from "@/services/providerService";
import { getProducts, Product } from "@/services/productService";
import { getBranches, Branch } from "@/services/branchService"; // Importar sucursales

type PurchaseCartItem = {
    product_id: number;
    name: string;
    quantity: number;
    cost: number;
};

export default function CreatePurchasePage() {
    const router = useRouter();
    const { toast } = useToast();

    // Estados para los datos de los catálogos
    const [providers, setProviders] = useState<Provider[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Estados del formulario
    const [selectedProviderId, setSelectedProviderId] = useState<string>('');
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [cart, setCart] = useState<PurchaseCartItem[]>([]);
    const [paidAmount, setPaidAmount] = useState<number>(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [providersData, branchesData, productsData] = await Promise.all([
                    getProviders(),
                    getBranches(),
                    getProducts()
                ]);
                setProviders(providersData);
                setBranches(branchesData);
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos necesarios.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleAddProductToCart = (productId: string) => {
        if (!productId) return;
        const id = Number(productId);

        if (cart.some(item => item.product_id === id)) {
            return toast({ title: "Atención", description: "Este producto ya está en la compra.", variant: "destructive" });
        }

        const productToAdd = products.find(p => p.id === id);
        if (productToAdd) {
            setCart(prev => [...prev, { product_id: productToAdd.id, name: productToAdd.name, quantity: 1, cost: productToAdd.cost || 0 }]);
        }
    };

    const handleCartChange = (index: number, field: 'quantity' | 'cost', value: number) => {
        const updatedCart = [...cart];
        updatedCart[index][field] = value;
        setCart(updatedCart);
    };

    const handleRemoveFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const total = useMemo(() => cart.reduce((acc, item) => acc + item.cost * item.quantity, 0), [cart]);

    const handleSavePurchase = async () => {
        if (!selectedProviderId || !selectedBranchId || cart.length === 0) {
            return toast({
                title: "Faltan datos",
                description: "Por favor, seleccione proveedor, sucursal y añada al menos un producto.",
                variant: "destructive"
            });
        }
        setLoading(true);

        try {
            const purchaseData = {
                provider_id: Number(selectedProviderId),
                branch_id: Number(selectedBranchId),
                date: purchaseDate,
                total: total,
                paid: paidAmount,
                details: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    cost: item.cost,
                }))
            };

            await createPurchase(purchaseData);

            toast({
                title: "Éxito",
                description: "La compra ha sido registrada correctamente."
            });
            router.push('/compras');

        } catch (error) {
            console.error("Error saving purchase:", error);
            toast({
                title: "Error",
                description: "No se pudo registrar la compra.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Registrar Compra</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / <Link href="/compras" className="hover:text-primary">Compras</Link> / Crear
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader><CardTitle>1. Datos de la Compra</CardTitle></CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha*</Label>
                                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Proveedor*</Label>
                                <Select onValueChange={setSelectedProviderId} value={selectedProviderId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{providers.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sucursal*</Label>
                                <Select onValueChange={setSelectedBranchId} value={selectedBranchId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>2. Productos de la Compra</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Añadir Producto</Label>
                                <Select onValueChange={handleAddProductToCart}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar un producto..." /></SelectTrigger>
                                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Cantidad</TableHead><TableHead>Costo Unitario</TableHead><TableHead>Subtotal</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {cart.length > 0 ? cart.map((item, index) => (
                                            <TableRow key={item.product_id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleCartChange(index, 'quantity', Number(e.target.value))} className="w-24" /></TableCell>
                                                <TableCell><Input type="number" value={item.cost} onChange={(e) => handleCartChange(index, 'cost', Number(e.target.value))} className="w-24" /></TableCell>
                                                <TableCell>${(item.quantity * item.cost).toFixed(2)}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveFromCart(item.product_id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={5} className="text-center h-24">Añada productos a la compra</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
                     <Card>
                        <CardHeader><CardTitle>3. Resumen y Pago</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between font-bold text-xl text-primary border-t pt-4">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="paidAmount">Monto Pagado</Label>
                                <Input id="paidAmount" type="number" placeholder="0.00" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
                            </div>
                             <div className="flex justify-between font-bold text-lg text-red-600">
                                <span>Adeudo:</span>
                                <span>${(total - paidAmount).toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" disabled={cart.length === 0 || loading} onClick={handleSavePurchase}>
                                <Save className="mr-2"/> {loading ? 'Guardando...' : 'Guardar Compra'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
