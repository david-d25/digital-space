import {RefObject, useEffect, useRef} from 'react';

/** Below this the layout stacks and the shelf is effectively the whole page. */
const STACKED = '(max-width: 864px)';

/** Used if the panel has no `--fold-duration` to read. */
const FALLBACK_MS = 360;

/**
 * Walks the panel's top edge up to the top of the screen while the shelf
 * opens or closes, in step with the fold.
 *
 * Stacked, the shelf is the only thing on screen worth looking at, and the
 * fold changes the height of what is above it — so without this the panel
 * drifts up or down under the reader. Pinning it to the top is a decision
 * rather than a correction: wherever they were, opening the shelf puts its
 * heading at the top of the screen and closing it brings them back to it.
 *
 * Side by side it does nothing. There the shelf is one column of a page, not
 * the page, and hauling it to the top would be an answer to a question nobody
 * asked.
 *
 * Written as a closed loop — measure where the panel actually is, correct
 * towards where it should be by now — rather than a scroll computed once at
 * the start. The layout is moving underneath for the whole gesture, and the
 * browser's own scroll anchoring may be moving with it, so any figure worked
 * out in advance is wrong by the second frame. Measuring is also what makes
 * it degrade quietly when the page is too short to scroll that far.
 */
export function useShelfScroll(panel: RefObject<HTMLElement | null>, expanded: boolean): void {
    /* Seeded with the state we mounted in, so a cold load of /books does not
     * scroll anybody anywhere. */
    const previous = useRef(expanded);

    useEffect(() => {
        if (previous.current === expanded) {
            return;
        }
        previous.current = expanded;

        const element = panel.current;
        if (element === null || !window.matchMedia(STACKED).matches) {
            return;
        }

        const styles = getComputedStyle(element);

        /* The panel already declares how far below the top it likes to sit
         * when something scrolls to it. */
        const inset = Number.parseFloat(styles.scrollMarginTop) || 0;
        const distance = element.getBoundingClientRect().top - inset;
        if (Math.abs(distance) < 1) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollBy(0, distance);
            return;
        }

        /* The whole gesture, both beats of it, so the panel arrives at the
         * top as the second one finishes rather than partway through. */
        const duration = (parseMs(styles.getPropertyValue('--fold-duration')) ?? FALLBACK_MS)
            + (parseMs(styles.getPropertyValue('--fold-stagger')) ?? 0);
        const ease = parseEase(styles.getPropertyValue('--fold-ease'));

        let frame = 0;
        let running = true;
        const started = performance.now();

        const stop = () => {
            running = false;
            if (frame !== 0) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            for (const name of INTERRUPTS) {
                window.removeEventListener(name, stop);
            }
        };

        /* Any sign that the reader has taken over hands the scroll back to
         * them mid-flight. Deliberately not the `scroll` event, which our own
         * movement fires. */
        for (const name of INTERRUPTS) {
            window.addEventListener(name, stop, {passive: true});
        }

        const step = (now: number) => {
            frame = 0;
            if (!running) {
                return;
            }

            const progress = Math.min(1, (now - started) / duration);
            const wanted = distance * (1 - ease(progress));
            const actual = element.getBoundingClientRect().top - inset;

            window.scrollBy(0, actual - wanted);

            if (progress < 1) {
                frame = requestAnimationFrame(step);
            } else {
                stop();
            }
        };

        frame = requestAnimationFrame(step);
        return stop;
    }, [expanded, panel]);
}

const INTERRUPTS = ['wheel', 'touchstart', 'keydown'] as const;

function parseMs(value: string): number | null {
    const text = value.trim();
    const number = Number.parseFloat(text);
    if (!Number.isFinite(number)) {
        return null;
    }
    return text.endsWith('ms') ? number : number * 1000;
}

/**
 * The `cubic-bezier(...)` the fold is using, as a function, so the scroll and
 * the layout are on the same curve rather than merely the same length.
 */
function parseEase(value: string): (t: number) => number {
    const match = /cubic-bezier\(([^)]+)\)/.exec(value);
    if (match === null) {
        return t => t;
    }

    const [x1, y1, x2, y2] = match[1].split(',').map(part => Number.parseFloat(part));
    if ([x1, y1, x2, y2].some(n => !Number.isFinite(n))) {
        return t => t;
    }

    return bezier(x1, y1, x2, y2);
}

/** A unit cubic Bézier solved for y at a given x, by Newton's method. */
function bezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    const atX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const atY = (t: number) => ((ay * t + by) * t + cy) * t;
    const slope = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    return x => {
        let t = x;
        for (let i = 0; i < 8; i++) {
            const error = atX(t) - x;
            if (Math.abs(error) < 1e-5) {
                break;
            }
            const derivative = slope(t);
            if (Math.abs(derivative) < 1e-6) {
                break;
            }
            t -= error / derivative;
        }
        return atY(t);
    };
}
