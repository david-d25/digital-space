import React, {useContext, useEffect, useMemo, useRef} from 'react';

import {ShineContext, ShineTargetOptions, useShineTarget} from './ShineRegistry';

type Props = {
    children: React.ReactNode,
    /**
     * Pins this one target's light height, overriding the size scaling.
     */
    lightHeight?: number,
    /**
     * Register the first element the child renders, instead of handing the
     * child a ref. Costs a boxless wrapper node and has to guess which
     * element is the target, so it is opt-in — for children that cannot take
     * a ref, such as ones from a library.
     */
    wrap?: boolean
};

/**
 * Marks its child as something the surrounding `Shine` should light.
 *
 *     <Shine>
 *         {projects.map(p => (
 *             <ShineTarget key={p.href}><ProjectCard {...p}/></ShineTarget>
 *         ))}
 *     </Shine>
 *
 * Use this over `useShineTarget` wherever targets are produced in a loop or
 * written inline, since a hook cannot be called per item. Where a component
 * has exactly one target of its own, the hook is less indirection.
 *
 * By default it adds nothing to the DOM: the ref is passed to the child
 * element itself, so nothing moves in the layout and no guess is made about
 * which node was meant. That does mean the child has to accept a ref — every
 * intrinsic element does, and so does anything that declares one. A child
 * that quietly drops it is reported in development, since the alternative is
 * an effect that simply never appears.
 */
export default function ShineTarget(props: Props) {
    return props.wrap === true
        ? <WrappedTarget {...props}/>
        : <ClonedTarget {...props}/>;
}

function useTargetOptions(lightHeight: number | undefined): ShineTargetOptions | undefined {
    return useMemo(
        () => lightHeight === undefined ? undefined : {lightHeight},
        [lightHeight]
    );
}

/** Hands the ref to the child element. No wrapper, nothing to guess. */
function ClonedTarget(props: Props) {
    const shine = useShineTarget<Element>(useTargetOptions(props.lightHeight));
    const child = React.Children.only(props.children);
    const attached = useRef(false);

    const existing = React.isValidElement<{ref?: React.Ref<Element>}>(child)
        ? child.props.ref
        : undefined;

    const ref = useMemo(() => mergeRefs(existing, (element: Element | null) => {
        attached.current = element !== null;
        return shine(element);
    }), [existing, shine]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && !attached.current) {
            console.warn(
                'ShineTarget: the child never took the ref, so it will not light. '
                + 'Give the component a `ref` prop that reaches its root element, '
                + 'or use <ShineTarget wrap> to register its first child instead.'
            );
        }
    }, []);

    if (!React.isValidElement(child)) {
        return <>{props.children}</>;
    }

    return React.cloneElement(child as React.ReactElement<{ref?: React.Ref<Element>}>, {ref});
}

/**
 * Wraps the children in an element that generates no box of its own and
 * registers the first element inside it.
 *
 * `display: contents` keeps the layout untouched — the children stay direct
 * flex or grid items of whatever is above — but the wrapper is still in the
 * DOM tree, so a child combinator or `:nth-child` written against the parent
 * will no longer match through it.
 */
function WrappedTarget(props: Props) {
    const registry = useContext(ShineContext);
    const options = useTargetOptions(props.lightHeight);
    const host = useRef<HTMLSpanElement>(null);
    const registered = useRef<Element | null>(null);

    /* No dependency list: the child can swap its root element on any render,
     * and comparing what we find against what we hold is cheaper than
     * watching for it. */
    useEffect(() => {
        const found = host.current?.firstElementChild ?? null;
        if (registry === null || found === registered.current) {
            return;
        }

        if (registered.current !== null) {
            registry.remove(registered.current);
        }
        registered.current = found;
        if (found !== null) {
            registry.add(found, options ?? {});
        }
    });

    useEffect(() => () => {
        if (registered.current !== null) {
            registry?.remove(registered.current);
            registered.current = null;
        }
    }, [registry]);

    return <span ref={host} style={{display: 'contents'}}>{props.children}</span>;
}

/**
 * Runs several refs off one attachment, so adding the effect to an element
 * does not take away a ref it already had.
 */
function mergeRefs<T extends Element>(
    ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
    return element => {
        const cleanups: (() => void)[] = [];

        for (const ref of refs) {
            if (typeof ref === 'function') {
                const cleanup = ref(element);
                if (typeof cleanup === 'function') {
                    cleanups.push(cleanup);
                }
            } else if (ref !== null && ref !== undefined) {
                ref.current = element;
                cleanups.push(() => {
                    ref.current = null;
                });
            }
        }

        return () => {
            for (const cleanup of cleanups) {
                cleanup();
            }
        };
    };
}
