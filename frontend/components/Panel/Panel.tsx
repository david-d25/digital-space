import React from 'react';
import style from './Panel.module.scss';
import {classnames} from '@/lib/classnames';

type Props = {
    children?: React.ReactNode,
    /** `panel` is the frosted glass surface, `card` a flat tinted block inside a panel. */
    variant?: 'panel' | 'card',
    /** Accent wash for `card`, matching the project colors. */
    accent?: 'none' | 'blue' | 'green' | 'orange',
    /** `large` gives the surface the wider radius and roomier padding. */
    size?: 'regular' | 'large',
    noPadding?: boolean,
    /** Turns the whole surface into a link. */
    href?: string,
    id?: string,
    as?: 'div' | 'section' | 'article' | 'aside',
    className?: string,
    style?: React.CSSProperties,
    /**
     * Handed to the rendered element. Lets callers reach the real node
     * without wrapping the panel in something just to have one to point at —
     * `useShineTarget` is the reason this exists.
     */
    ref?: React.Ref<HTMLElement>
};

export default function Panel(props: Props) {
    const Tag = props.href ? 'a' : (props.as || 'div');
    const className = classnames(
        {
            [style.surface]: true,
            [style.panel]: (props.variant || 'panel') === 'panel',
            [style.card]: props.variant === 'card',
            [style.large]: props.size === 'large',
            [style.noPadding]: props.noPadding,
        },
        props.className
    );
    return (
        <Tag
            /* `Tag` is a union of intrinsic tags whose ref types differ, so
             * there is no single type satisfying all of them at once. */
            ref={props.ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
            id={props.id}
            href={props.href}
            /*
             * A link is draggable by default, and a whole panel makes a
             * poor thing to drag: the ghost image is the entire card, and
             * nobody wants to drop a project somewhere. Switching it off
             * also keeps a short drag on the surface from starting a native
             * drag at all, which is a state this page has been getting
             * stuck in — frames keep coming, but input stops being routed.
             */
            draggable={props.href === undefined ? undefined : false}
            className={className}
            style={props.style}
            data-accent={props.accent || 'none'}
        >
            {props.children}
        </Tag>
    );
}
