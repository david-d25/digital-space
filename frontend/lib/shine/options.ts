import {DEFAULT_SHINE_PARAMS, ShineColor, ShineParams} from './shineRenderer';

/**
 * The author-facing shape of the effect's settings.
 *
 * Everything is optional and falls back to the tuned defaults, and `color`
 * takes any CSS colour rather than the renderer's numeric triple, so a call
 * site can hand over a custom property and let the cascade answer.
 */
export type ShineOptions = Partial<Omit<ShineParams, 'color'>> & {
    color?: string
};

/**
 * Settings per theme. `base` applies to both; `light` and `dark` are layered
 * over it, so only what actually differs has to be written twice.
 */
export type ShineThemeOptions = {
    base?: ShineOptions,
    light?: ShineOptions,
    dark?: ShineOptions
};

export type ResolvedTheme = 'light' | 'dark';

/**
 * Turns a CSS colour into the renderer's sRGB triple.
 *
 * Two steps, because neither alone is enough: the cascade resolves custom
 * properties and keywords but hands back whatever notation it likes, and a
 * canvas parses every notation but knows nothing of the cascade. `scope` is
 * the element the colour is written against, which is what lets
 * `var(--brand)` mean the right thing.
 *
 * Returns null when the colour cannot be read at all, so the caller can keep
 * whatever it had rather than silently turning the effect black.
 */
export function resolveShineColor(value: string, scope: Element): ShineColor | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const probe = document.createElement('span');
    probe.style.color = value;
    probe.style.display = 'none';
    scope.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();

    if (!computed) {
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', {willReadFrequently: true});
    if (context === null) {
        return null;
    }

    /* An unparseable value leaves fillStyle at its default, which would
     * silently paint black, so check that it actually took. */
    context.fillStyle = '#000';
    context.fillStyle = computed;
    if (context.fillStyle === '#000000' && !/^(#000000|black|rgba?\(0,\s*0,\s*0)/i.test(computed)) {
        return null;
    }

    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
}

/**
 * Flattens base plus the active theme's overrides onto the defaults, and
 * turns the colour into something the renderer can upload.
 */
export function resolveShineParams(
    options: ShineThemeOptions,
    theme: ResolvedTheme,
    scope: Element
): ShineParams {
    const merged: ShineOptions = {
        ...options.base,
        ...(theme === 'dark' ? options.dark : options.light)
    };

    const {color, ...numeric} = merged;
    const resolved = color === undefined ? null : resolveShineColor(color, scope);

    return {
        ...DEFAULT_SHINE_PARAMS,
        ...numeric,
        color: resolved ?? DEFAULT_SHINE_PARAMS.color
    };
}

/**
 * Whether two parameter sets would draw the same thing, so the overlay can
 * skip handing the renderer a new object on every render.
 */
export function shineParamsEqual(a: ShineParams, b: ShineParams): boolean {
    const keys = Object.keys(a) as (keyof ShineParams)[];

    return keys.every(key => {
        if (key === 'color') {
            return a.color[0] === b.color[0]
                && a.color[1] === b.color[1]
                && a.color[2] === b.color[2];
        }
        return a[key] === b[key];
    });
}
