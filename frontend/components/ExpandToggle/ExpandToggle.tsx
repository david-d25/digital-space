import React from 'react';

import ShallowLink from '@/components/ShallowLink/ShallowLink';
import {classnames} from '@/lib/classnames';

import style from './ExpandToggle.module.scss';

type Props = {
    expanded: boolean,
    /** Where each state leads: the open address, and the closed one. */
    href: string,
    /**
     * What is being opened, for the label a screen reader reads — "the shelf"
     * gives "Expand the shelf". The visible label stays the verb alone.
     */
    region: string,
    className?: string
};

/*
 * Two chevrons, apart to open and facing each other to close. Vertical rather
 * than the diagonal pair a fullscreen control uses, because that is the axis
 * the panel actually grows on: it gets taller, it does not take over the
 * screen. Swapping in the diagonal version is a matter of these four paths.
 */
// TODO use existing icons?
const CHEVRONS = {
    expand: ['M4.5 6 L8 2.5 L11.5 6', 'M4.5 10 L8 13.5 L11.5 10'],
    collapse: ['M4.5 2.5 L8 6 L11.5 2.5', 'M4.5 13.5 L8 10 L11.5 13.5']
};

/**
 * The control that opens and closes a panel, sitting along its bottom edge.
 *
 * In the corner it read as a secondary link; centred under the content it
 * reads as "there is more of this", which is what it means. It is also where
 * the panel grows from, so the hover hint — the panel gaining a few pixels of
 * height under the button, which stays where it is — lands in the right
 * place. That hint belongs to the panel rather than to this component, since
 * it is the panel that grows; `[data-expand-toggle]` is the hook for it, and
 * an attribute rather than a class so a stylesheet that does not import this
 * module can still reach it.
 */
export default function ExpandToggle(props: Props) {
    const state = props.expanded ? 'collapse' : 'expand';
    const [top, bottom] = CHEVRONS[state];

    return (
        <div className={classnames(style.row, props.className)}>
            <ShallowLink
                href={props.href}
                className={style.toggle}
                aria-label={`${props.expanded ? 'Collapse' : 'Expand'} ${props.region}`}
            >
                <span className={style.button} data-expand-toggle={state}>
                    <svg
                        className={style.icon}
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path className={style.top} d={top}/>
                        <path className={style.bottom} d={bottom}/>
                    </svg>
                    <span>{props.expanded ? 'Collapse' : 'Expand'}</span>
                </span>
            </ShallowLink>
        </div>
    );
}
