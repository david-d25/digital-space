export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ds-theme';

/**
 * Runs before the first paint to avoid a flash of the wrong theme: picks the
 * stored choice, falls back to the system one, and puts it on `<html>` so the
 * tokens in `styles/tokens.scss` resolve correctly right away.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()`;

export function getStoredTheme(): Theme | null {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
        return null;
    }
}

export function getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function storeTheme(theme: Theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Private mode or blocked storage — the choice just won't survive a reload.
    }
}

export function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
}

export const THEME_TRANSITION_CLASS = 'theme-transition';
export const THEME_TRANSITION_MS = 300;

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Same as `applyTheme`, but lets the palette cross-fade. The class is only
 * held for the length of the fade: keeping it on would put a 300ms delay on
 * every hover and state change on the page.
 */
export function applyThemeAnimated(theme: Theme) {
    const root = document.documentElement;
    root.classList.add(THEME_TRANSITION_CLASS);
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(
        () => root.classList.remove(THEME_TRANSITION_CLASS),
        THEME_TRANSITION_MS
    );
    applyTheme(theme);
}
