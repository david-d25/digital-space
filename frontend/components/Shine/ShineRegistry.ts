import {createContext, useCallback, useContext, useRef} from 'react';

/** Per-target settings, the hook's equivalent of the `data-shine-*` attributes. */
export type ShineTargetOptions = {
    /**
     * An absolute light height for this one element, overriding whatever the
     * size scaling would have worked out.
     */
    lightHeight?: number
};

/**
 * Where targets announce themselves to the overlay above them.
 *
 * The alternative is a CSS selector, which still works and is the right tool
 * for markup nobody owns. But a selector needs a DOM element to match, and a
 * React component only has one if it forwards an attribute or a ref down to
 * it — which is how a wrapper div gets added purely to carry a marker.
 * Registering sidesteps that, and React tells us exactly when an element
 * goes, rather than a mutation observer noticing a frame later.
 */
export class ShineRegistry {
    private readonly targets = new Map<Element, ShineTargetOptions>();
    private listener: (() => void) | null = null;

    add(element: Element, options: ShineTargetOptions): void {
        this.targets.set(element, options);
        this.listener?.();
    }

    remove(element: Element): void {
        if (this.targets.delete(element)) {
            this.listener?.();
        }
    }

    entries(): ReadonlyMap<Element, ShineTargetOptions> {
        return this.targets;
    }

    /** The overlay's cue to re-measure. Only one overlay reads a registry. */
    onChange(listener: (() => void) | null): void {
        this.listener = listener;
    }
}

export const ShineContext = createContext<ShineRegistry | null>(null);

/**
 * Marks an element as something the surrounding `Shine` should light:
 *
 *     const shine = useShineTarget();
 *     return <Panel ref={shine}>…</Panel>;
 *
 * Returns a ref callback, so it attaches to whatever element it is given and
 * needs no attribute threaded through the components in between. Outside a
 * `Shine` it does nothing at all, which keeps a component that uses it usable
 * anywhere.
 */
export function useShineTarget<T extends Element = HTMLElement>(
    options?: ShineTargetOptions
): (element: T | null) => void {
    const registry = useContext(ShineContext);

    /* Read at registration time rather than captured, so changing a value
     * does not detach and reattach the ref. */
    const optionsRef = useRef(options);
    optionsRef.current = options;

    /* Settings are compared by value: an inline object literal would
     * otherwise be a new one on every render and churn the ref. */
    const key = JSON.stringify(options ?? {});

    return useCallback((element: T | null) => {
        if (registry === null || element === null) {
            return;
        }

        registry.add(element, optionsRef.current ?? {});

        /* React calls this when the element unmounts or the ref moves on,
         * which is the exact moment the target stops existing. */
        return () => registry.remove(element);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registry, key]);
}
