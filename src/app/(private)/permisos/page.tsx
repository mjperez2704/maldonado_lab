
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileKey, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getRoles, getPermissionsByRole, updatePermissionsForRole, Role, Permission } from '@/services/permissionService';
import { menuGroups } from '@/components/layout/AppSidebar';

export default function PermissionsPage() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        getRoles()
            .then(data => {
                setRoles(data);
                if (data.length > 0) {
                    setSelectedRole(data[0]);
                }
            })
            .catch(err => {
                console.error("Error fetching roles:", err);
                toast({ title: "Error", description: "No se pudieron cargar los roles.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, [toast]);

    const fetchPermissions = useCallback(async (roleId: number) => {
        setLoading(true);
        try {
            const currentPermissions = await getPermissionsByRole(roleId);
            const permissionsMap = menuGroups.flatMap(g => g.items).reduce((acc, item) => {
                acc[item.key] = currentPermissions.some(p => p.moduleKey === item.key);
                return acc;
            }, {} as Record<string, boolean>);
            setPermissions(permissionsMap);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            toast({ title: "Error", description: `No se pudieron cargar los permisos para el rol ${selectedRole?.name}.`, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast, selectedRole?.name]);

    useEffect(() => {
        if (selectedRole) {
            fetchPermissions(selectedRole.id);
        }
    }, [selectedRole, fetchPermissions]);

    const handlePermissionChange = (moduleKey: string, checked: boolean) => {
        setPermissions(prev => ({ ...prev, [moduleKey]: checked }));
    };
    
    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const grantedPermissions = Object.entries(permissions)
                .filter(([, hasAccess]) => hasAccess)
                .map(([moduleKey]) => moduleKey);

            await updatePermissionsForRole(selectedRole.id, grantedPermissions);
            toast({ title: "Éxito", description: `Permisos para ${selectedRole.name} actualizados.` });
        } catch (err) {
            console.error("Error saving permissions:", err);
            toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="flex flex-col gap-6 py-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileKey className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Permisos de Usuario</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Hogar</Link> / Permisos
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <nav className="flex flex-col gap-1">
                                {roles.map(role => (
                                    <Button
                                        key={role.id}
                                        variant={selectedRole?.id === role.id ? 'default' : 'ghost'}
                                        onClick={() => setSelectedRole(role)}
                                        className="justify-start gap-2"
                                    >
                                        <ShieldCheck className="h-4 w-4"/>
                                        {role.name}
                                    </Button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Módulos Permitidos para: <span className="text-primary">{selectedRole?.name}</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loading ? (
                                <p>Cargando permisos...</p>
                            ) : menuGroups.map(group => (
                                <div key={group.label}>
                                    <h3 className="font-semibold text-lg mb-2 border-b pb-1">{group.label}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {group.items.map(item => (
                                            <div key={item.key} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                                <Checkbox
                                                    id={`${selectedRole?.id}-${item.key}`}
                                                    checked={permissions[item.key] || false}
                                                    onCheckedChange={(checked) => handlePermissionChange(item.key, !!checked)}
                                                />
                                                <label
                                                    htmlFor={`${selectedRole?.id}-${item.key}`}
                                                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    <item.icon className="h-4 w-4 text-muted-foreground"/>
                                                    {item.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <div className="flex justify-end p-6">
                           <Button onClick={handleSavePermissions} disabled={saving}>
                             <Save className="mr-2 h-4 w-4"/> {saving ? 'Guardando...' : 'Guardar Permisos'}
                           </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
