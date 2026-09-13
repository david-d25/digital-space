import React, {useMemo} from 'react';

import {classnames} from '@/lib/classnames';
import {ShineThemeOptions} from '@/lib/shine/options';
import ShineOverlay, {ShineGate} from './ShineOverlay';
import {ShineContext, ShineRegistry} from './ShineRegistry';

import style from './Shine.module.scss';

type Props = {
    children?: React.ReactNode,
    /** Settings, optionally split by theme. */
    options?: ShineThemeOptions,
    /**
     * A CSS selector for targets, on top of anything that registered itself
     * with `useShineTarget`. Handy for markup you do not control; leave it
     * alone and mark elements with `data-shine` or the hook.
     */
    selector?: string,
    /** Light the target under the pointer, or every target at once. */
    gate?: ShineGate,
    /** How the glints composite onto whatever is underneath. */
    blendMode?: React.CSSProperties['mixBlendMode'],
    className?: string
};

/**
 * Wraps a region and lights whichever target inside it the pointer is over.
 *
 *     const shine = useShineTarget();
 *
 *     <Shine options={{light: {color: 'oklch(60% 0.2 265)'}}}>
 *         <Panel ref={shine}>…</Panel>
 *         <button data-shine>Press me</button>
 *     </Shine>
 *
 * One of these serves any number of targets — only the lit one is drawn — so
 * put it around a section rather than around each element. Two things do
 * scale with where it goes: it holds a WebGL context, of which a document
 * gets about sixteen, and its canvas spans the whole wrapped box, so wrapping
 * a very long region means a very large buffer.
 *
 * It renders one positioned element of its own for the canvas to sit in. When
 * even that is one box too many, put `ShineOverlay` straight inside an
 * element you already have and give that element `position: relative`; the
 * selector still works there, though the hook does not, since the targets
 * would not be inside the provider.
 */
export default function Shine(props: Props) {
    const registry = useMemo(() => new ShineRegistry(), []);

    return (
        <div className={classnames(style.scope, props.className)}>
            <ShineContext.Provider value={registry}>
                {props.children}
            </ShineContext.Provider>

            <ShineOverlay
                registry={registry}
                options={props.options}
                selector={props.selector}
                gate={props.gate}
                blendMode={props.blendMode}
            />
        </div>
    );
}
