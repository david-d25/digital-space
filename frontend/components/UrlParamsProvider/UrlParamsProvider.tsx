"use client";
import React, { createContext, useContext, useMemo } from "react";

const Ctx = createContext<URLSearchParams | null>(null);

export function UrlParamsProvider({
                                      initialSearch, children,
                                  }: { initialSearch: string; children: React.ReactNode }) {
    const value = useMemo(() => new URLSearchParams(initialSearch), [initialSearch]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useServerSearchParams() {
    return useContext(Ctx);
}