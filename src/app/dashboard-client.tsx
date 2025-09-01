
'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wifi, X } from "lucide-react";

const AlertCard = ({ icon: Icon, text, colorClass, onDismiss }: { icon: React.ElementType, text: string, colorClass: string, onDismiss?: () => void }) => {
    return (
        <div className={`${colorClass} text-white p-3 rounded-md flex justify-between items-center`}>
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{text}</span>
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-white hover:text-white/80">
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default function DashboardClientComponent() {
    const [onlineUserCount, setOnlineUserCount] = useState(1); // Mocked value
    const [showUsersAlert, setShowUsersAlert] = useState(true);
    const [showVisitsAlert, setShowVisitsAlert] = useState(true);

    return (
        <>
            <div className="space-y-4">
                {showUsersAlert && (
                    <AlertCard 
                        icon={Wifi} 
                        text={`Usuarios en línea (${onlineUserCount})`} 
                        colorClass="bg-green-500"
                    />
                )}
                <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                        {onlineUserCount > 0 ? `${onlineUserCount} usuario(s) en línea` : 'No hay usuarios en línea'}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                {showVisitsAlert && (
                    <AlertCard 
                        icon={Bell} 
                        text="Visitas domiciliarias programadas hoy (0)" 
                        colorClass="bg-red-500"
                        onDismiss={() => setShowVisitsAlert(false)}
                    />
                )}
                <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                        Datos no disponibles
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
