import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {applyThemeAnimated, getStoredTheme, getSystemTheme, storeTheme, Theme} from '@/lib/theme';

type ThemeContextValue = {
    theme: Theme,
    /** `false` until the effect has read the real theme on the client. */
    resolved: boolean,
    setTheme: (theme: Theme) => void,
    toggleTheme: () => void
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Keeps the theme in `<html data-theme>`, remembering an explicit choice and
 * otherwise following the system. The initial value is already applied by
 * `THEME_INIT_SCRIPT`; this only mirrors it into React and handles changes.
 */
export function ThemeProvider(props: { children?: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [resolved, setResolved] = useState(false);

    useEffect(() => {
        setThemeState(getStoredTheme() ?? getSystemTheme());
        setResolved(true);
    }, []);

    // Follow the system while the visitor hasn't picked a theme by hand.
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => {
            if (getStoredTheme() !== null) return;
            const next = getSystemTheme();
            applyThemeAnimated(next);
            setThemeState(next);
        };
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        storeTheme(next);
        applyThemeAnimated(next);
        setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{theme, resolved, setTheme, toggleTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const value = useContext(ThemeContext);
    if (!value) {
        throw new Error('useTheme must be used inside a ThemeProvider');
    }
    return value;
}
