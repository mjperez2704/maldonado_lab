"use client";

import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export type CrudAction = "create" | "read" | "update" | "delete" | "idle";

type Media =
    | { type: "gif"; src: string; alt?: string }
    | { type: "mp4"; src: string; alt?: string };

export type LoaderMessages = Partial<Record<CrudAction, string>>;
export type LoaderMedia = Partial<Record<CrudAction, Media>>;

type LoaderContextValue = {
    status: CrudAction;
    message: string;
    start: (action: Exclude<CrudAction, "idle">, customMessage?: string) => void;
    stop: () => void;
    setMedia: (media: LoaderMedia) => void;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

const DEFAULT_MESSAGES: LoaderMessages = {
    create: "AGREGANDO…",
    read: "CONSULTANDO…",
    update: "ACTUALIZANDO…",
    delete: "ELIMINANDO…",
};

export function LoaderProvider({
                                   children,
                                   messages,
                                   initialMedia,
                                   zIndex = 9999,
                               }: {
    children: ReactNode;
    messages?: LoaderMessages;
    initialMedia?: LoaderMedia;
    zIndex?: number;
}) {
    const [status, setStatus] = useState<CrudAction>("idle");
    const [msgMap, setMsgMap] = useState<LoaderMessages>({ ...DEFAULT_MESSAGES, ...messages });
    const [media, setMedia] = useState<LoaderMedia>(initialMedia ?? {});

    const start = useCallback((action: Exclude<CrudAction, "idle">, customMessage?: string) => {
        if (customMessage) {
            setMsgMap((m) => ({ ...m, [action]: customMessage }));
        }
        setStatus(action);
    }, []);

    const stop = useCallback(() => {
        setStatus("idle");
    }, []);

    const value = useMemo<LoaderContextValue>(
        () => ({
            status,
            message: status === "idle" ? "" : (msgMap[status] ?? ""),
            start,
            stop,
            setMedia,
        }),
        [status, msgMap, start, stop]
    );

    return (
        <LoaderContext.Provider value={value}>
            {children}
            <LoaderOverlay
                open={status !== "idle"}
                message={status === "idle" ? "" : (msgMap[status] ?? "")}
                media={status === "idle" ? undefined : media[status]}
                zIndex={zIndex}
            />
        </LoaderContext.Provider>
    );
}

export function useLoader() {
    const ctx = useContext(LoaderContext);
    if (!ctx) throw new Error("useLoader debe usarse dentro de <LoaderProvider>.");
    return ctx;
}

function LoaderOverlay({
                           open,
                           message,
                           media,
                           zIndex,
                       }: {
    open: boolean;
    message: string;
    media?: Media;
    zIndex: number;
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div
            aria-live="assertive"
            aria-busy={open}
            aria-modal="true"
            role="alertdialog"
            style={{
                position: "fixed",
                inset: 0,
                display: open ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(2px)",
                zIndex,
            }}
        >
            <div
                style={{
                    minWidth: 260,
                    maxWidth: "min(92vw, 560px)",
                    borderRadius: 16,
                    padding: 24,
                    background: "#0b0b0b",
                    color: "#fff",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                    display: "grid",
                    gap: 16,
                    justifyItems: "center",
                    textAlign: "center",
                }}
            >
                {media ? (
                    media.type === "gif" ? (
                        <img
                            src={media.src}
                            alt={media.alt ?? "Cargando"}
                            style={{ width: 112, height: 112, objectFit: "contain" }}
                        />
                    ) : (
                        <video
                            src={media.src}
                            aria-label={media.alt ?? "Cargando"}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ width: 140, height: 140, objectFit: "contain", borderRadius: 12 }}
                        />
                    )
                ) : (
                    <div
                        aria-hidden
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            border: "6px solid rgba(255,255,255,0.18)",
                            borderTopColor: "#fff",
                            animation: "spin 0.9s linear infinite",
                        }}
                    />
                )}

                <div style={{ fontSize: 16, letterSpacing: 1.5, fontWeight: 600 }}>{message}</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>,
        document.body
    );
}
