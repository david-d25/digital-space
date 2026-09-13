import React, {useEffect, useRef, useState} from 'react';

import {ShineCard, ShineParams, ShineRenderer} from '@/lib/shine/shineRenderer';
import {resolveShineParams, ShineThemeOptions, shineParamsEqual} from '@/lib/shine/options';
import {useTheme} from '@/components/ThemeProvider/ThemeProvider';
import {ShineRegistry} from './ShineRegistry';

import style from './ShineOverlay.module.scss';

export type ShineGate = 'hover' | 'always';

type Props = {
    /** Where `useShineTarget` announces itself. `Shine` supplies one. */
    registry?: ShineRegistry,
    options?: ShineThemeOptions,
    /** Light the target under the pointer, or every target at once. */
    gate?: ShineGate,
    /** How the glints composite onto whatever is underneath. */
    blendMode?: React.CSSProperties['mixBlendMode'],
    /**
     * A CSS selector for targets, on top of anything in the registry.
     * Resolved inside the overlay's own parent.
     */
    selector?: string,
    onFps?: (fps: number) => void
};

const EMPTY_OPTIONS: ShineThemeOptions = {};

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Whether the visitor has a pointer that can hover.
 *
 * Without one the effect can never fire, and a WebGL context plus a canvas
 * the size of the whole region is a great deal to allocate for something that
 * will not be seen — on exactly the devices least able to spare it. Watched
 * rather than read once, because a tablet can be given a mouse mid-session.
 *
 * Only an effect depends on this, never the markup, so the server and the
 * first client render agree whatever it says.
 */
function useHoverCapable(): boolean {
    const [capable, setCapable] = useState(() => (
        typeof window !== 'undefined' && window.matchMedia(HOVER_QUERY).matches
    ));

    useEffect(() => {
        const query = window.matchMedia(HOVER_QUERY);
        const update = () => setCapable(query.matches);

        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    return capable;
}

/**
 * Lays a WebGL canvas over its parent and lights whichever element inside it
 * matches `selector` — a card, a button, anything — one at a time.
 *
 * The parent has to be positioned, and must not be an isolation group: the
 * blend modes need to reach the surface the targets are painted on. `Shine`
 * wraps both of those up; reach for this directly only when the parent has to
 * be an element you already have.
 *
 * One canvas and one WebGL context serve every target underneath, however
 * many there are: only the lit one is drawn, so the frame cost does not grow
 * with the count. A document gets about sixteen live contexts, so it is the
 * number of overlays that is worth keeping small, not the number of targets.
 */
export default function ShineOverlay(props: Props) {
    const selector = props.selector ?? '[data-shine]';
    const registry = props.registry;
    const gate = props.gate ?? 'hover';
    const options = props.options ?? EMPTY_OPTIONS;
    const {theme} = useTheme();
    const capable = useHoverCapable();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<ShineRenderer | null>(null);
    const hoveringRef = useRef(false);
    const onFpsRef = useRef(props.onFps);
    const paramsRef = useRef<ShineParams | null>(null);

    /* Read by the pointer handlers rather than closed over, so flipping the
     * gate does not tear the renderer down and rebuild it. */
    const gateRef = useRef(gate);

    /* Lighting means both starting the renderer and picking a target, so the
     * gate effect goes through the same function the pointer handlers use. */
    const applyHoverRef = useRef<(target: Element | null) => void>(() => {});
    const hoveredRef = useRef<Element | null>(null);

    useEffect(() => {
        onFpsRef.current = props.onFps;
        gateRef.current = gate;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container || !capable) {
            return;
        }

        const renderer = ShineRenderer.create(canvas);
        if (renderer === null) {
            return;
        }

        rendererRef.current = renderer;
        renderer.onFps = fps => onFpsRef.current?.(fps);

        let cards: ShineCard[] = [];
        let originX = 0;
        let originY = 0;
        let placed = false;

        const applyHover = (target: Element | null) => {
            hoveredRef.current = target;
            renderer.setHovered(gateRef.current === 'always' ? 'all' : target);
        };
        applyHoverRef.current = applyHover;

        /* Which target the pointer is inside, hit-tested against the rects
         * already measured rather than asked of the DOM: it costs nothing per
         * move, and it is right even when the pointer is over some child of
         * the target rather than the target itself. */
        const hitTest = (x: number, y: number): Element | null => {
            for (let index = cards.length - 1; index >= 0; index--) {
                const card = cards[index];
                if (x >= card.x && x <= card.x + card.width
                    && y >= card.y && y <= card.y + card.height) {
                    return card.element;
                }
            }
            return null;
        };

        /* Kept so the observer below can be told about arrivals and
         * departures without tearing the whole set down — re-observing an
         * element delivers a fresh callback, which would loop. */
        const observed = new Set<Element>();

        const measure = () => {
            const box = container.getBoundingClientRect();
            originX = box.left;
            originY = box.top;
            renderer.setSize(box.width, box.height);

            /*
             * Both ways in, deduplicated: elements that registered through
             * the hook and elements the selector finds. Sorted into document
             * order because the hit test takes the last match, which is what
             * makes a target nested inside another win over it — and effects
             * run innermost first, so registration order is the wrong way
             * round on its own.
             */
            const found = new Set<HTMLElement>(container.querySelectorAll<HTMLElement>(selector));
            if (registry !== undefined) {
                for (const element of registry.entries().keys()) {
                    if (element instanceof HTMLElement && container.contains(element)) {
                        found.add(element);
                    }
                }
            }

            const targets = [...found].sort((a, b) => (
                a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
            ));

            const next: ShineCard[] = [];
            const seen = new Set<Element>();

            for (const target of targets) {
                seen.add(target);
                if (!observed.has(target)) {
                    observed.add(target);
                    sizes.observe(target);
                }

                const rect = target.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    continue;
                }

                /* Per-element escape hatch, from the hook's options or from
                 * `data-shine-height="320"`: pins this one target's light
                 * height and opts it out of the size scaling, for the odd
                 * element the curve gets wrong. */
                const registered = registry?.entries().get(target)?.lightHeight;
                const pinned = registered ?? Number.parseFloat(target.dataset.shineHeight ?? '');

                next.push({
                    element: target,
                    x: rect.left - box.left,
                    y: rect.top - box.top,
                    width: rect.width,
                    height: rect.height,
                    diagonal: Math.hypot(rect.width, rect.height),
                    lightHeight: Number.isFinite(pinned) ? pinned : null,
                    /* Follows whatever radius the target already has. */
                    radius: parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0
                });
            }

            for (const gone of observed) {
                if (!seen.has(gone)) {
                    observed.delete(gone);
                    sizes.unobserve(gone);
                }
            }

            cards = next;
            renderer.setCards(next);

            /* Until the pointer says otherwise the light rests in the middle,
             * so `always` mode has something to show before the first move. */
            if (!placed && box.width > 0) {
                placed = true;
                renderer.setPointer(box.width / 2, box.height / 2);
            }
        };

        /*
         * Layout, children and attributes can all change several times in one
         * frame — a resize that reflows every card fires both observers — and
         * measuring walks every target and reads its computed style, so it is
         * worth doing at most once per frame.
         */
        let pending = 0;
        const scheduleMeasure = () => {
            if (pending !== 0) {
                return;
            }
            pending = requestAnimationFrame(() => {
                pending = 0;
                measure();
            });
        };

        const sizes = new ResizeObserver(scheduleMeasure);
        sizes.observe(container);

        /* Targets that appear, disappear, or change their pinned height after
         * mount. Without this a list that fills in later is never lit. */
        registry?.onChange(scheduleMeasure);

        const children = new MutationObserver(scheduleMeasure);
        children.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-shine', 'data-shine-height', 'class', 'style']
        });

        measure();

        const track = (event: PointerEvent) => {
            const x = event.clientX - originX;
            const y = event.clientY - originY;
            renderer.setPointer(x, y);
            applyHover(hitTest(x, y));
        };

        const onPointerMove = (event: PointerEvent) => track(event);

        const onPointerEnter = (event: PointerEvent) => {
            const box = container.getBoundingClientRect();
            originX = box.left;
            originY = box.top;
            hoveringRef.current = true;
            track(event);
        };

        const onPointerLeave = () => {
            hoveringRef.current = false;
            applyHover(null);
        };

        const onScroll = () => {
            if (!hoveringRef.current) {
                return;
            }
            const box = container.getBoundingClientRect();
            originX = box.left;
            originY = box.top;
        };

        container.addEventListener('pointermove', onPointerMove, {passive: true});
        container.addEventListener('pointerenter', onPointerEnter, {passive: true});
        container.addEventListener('pointerleave', onPointerLeave, {passive: true});
        window.addEventListener('scroll', onScroll, {passive: true, capture: true});

        return () => {
            container.removeEventListener('pointermove', onPointerMove);
            container.removeEventListener('pointerenter', onPointerEnter);
            container.removeEventListener('pointerleave', onPointerLeave);
            window.removeEventListener('scroll', onScroll, {capture: true});
            if (pending !== 0) {
                cancelAnimationFrame(pending);
            }
            registry?.onChange(null);
            sizes.disconnect();
            children.disconnect();
            renderer.destroy();
            rendererRef.current = null;
            paramsRef.current = null;
            applyHoverRef.current = () => {};
        };
    }, [selector, registry, capable]);

    /*
     * Settings are resolved against the container, because a colour given as
     * a custom property only means something inside the cascade it was
     * written for. Keyed by value rather than by object identity so a caller
     * need not memoise, and pushed only when something actually differs —
     * resolving a colour costs a style recalculation.
     */
    const optionsKey = JSON.stringify(options);
    useEffect(() => {
        const container = canvasRef.current?.parentElement;
        const renderer = rendererRef.current;
        if (!container || renderer === null) {
            return;
        }

        const resolved = resolveShineParams(options, theme, container);
        if (paramsRef.current !== null && shineParamsEqual(paramsRef.current, resolved)) {
            return;
        }

        paramsRef.current = resolved;
        renderer.setParams(resolved);
        /* `capable` is here because the renderer is built by the effect above,
         * which that flag gates: a later one has to be given its settings. */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsKey, theme, capable]);

    useEffect(() => {
        const current = hoveredRef.current;
        /* Whatever was under the pointer may have unmounted since. */
        applyHoverRef.current(current !== null && current.isConnected ? current : null);
    }, [gate]);

    return (
        <canvas
            ref={canvasRef}
            className={style.canvas}
            style={{mixBlendMode: props.blendMode ?? 'plus-lighter'}}
            aria-hidden="true"
        />
    );
}
