import { useEffect, useState } from "react";
import {useServerSearchParams} from "@/components/UrlParamsProvider/UrlParamsProvider";

export default function useUrlParamState<T extends string | null>(param: string, defaultValue: T) {
    const serverParams = useServerSearchParams();

    const [value, setValue] = useState<T>(() => {
        if (serverParams) {
            return (serverParams.get(param) as T) ?? defaultValue;
        }
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return (params.get(param) as T) ?? defaultValue; // CSR
        }
        return defaultValue;
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const onPop = () => {
            const params = new URLSearchParams(window.location.search);
            setValue((params.get(param) as T) ?? defaultValue);
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [param, defaultValue]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        if (value === null || value === defaultValue) {
            params.delete(param);
        } else {
            params.set(param, value);
        }
        const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", next);
    }, [param, value, defaultValue]);

    return [value, setValue] as const;
}

export function useUrlParamStateNumeric<T extends number | null>(param: string, defaultValue: T) {
    const [stringValue, setStringValue] = useUrlParamState<string | null>(
        param,
        defaultValue !== null ? defaultValue.toString() : null
    );

    const numericValue = stringValue !== null ? parseFloat(stringValue) : defaultValue;

    const setNumericValue = (newValue: T) => {
        if (newValue === null) {
            setStringValue(null);
        } else {
            setStringValue(newValue.toString());
        }
    };

    return [numericValue, setNumericValue] as const;
}

export function useUrlParamStateArray<T extends string>(param: string, defaultValue: T[]) {
    const [stringValue, setStringValue] = useUrlParamState<string | null>(
        param,
        defaultValue.length > 0 ? JSON.stringify(defaultValue) : null
    );

    const arrayValue = (() => {
        if (stringValue === null || stringValue.length === 0) {
            return defaultValue;
        }
        try {
            const parsed = JSON.parse(stringValue);
            return Array.isArray(parsed) ? (parsed as T[]) : defaultValue;
        } catch {
            return defaultValue;
        }
    })();

    const setArrayValue = (newValue: T[]) => {
        if (newValue.length === 0) {
            setStringValue(null);
        } else {
            setStringValue(JSON.stringify(newValue));
        }
    };

    return [arrayValue, setArrayValue] as const;
}