import React from 'react';
import ExternalLinkIcon from '@/icons/external-link.svg';
import style from './ContactRow.module.scss';
import {classnames} from '@/lib/classnames';

type Props = {
    /** Name of the destination or action, shown on the left. */
    label: string,
    /** Handle, address or current state, shown on the right in mono. */
    value?: React.ReactNode,
    href?: string,
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    /** `quiet` has no fill until hovered — for actions, not destinations. */
    variant?: 'filled' | 'quiet',
    /** Renders the value without hydration warnings, for client-only text. */
    valueIsClientOnly?: boolean
};

/** A pill-shaped row on the intro panel: contact links and the theme switch. */
export default function ContactRow(props: Props) {
    const className = classnames({
        [style.row]: true,
        [style.quiet]: props.variant === 'quiet',
    });
    /*
     * Rows that take you somewhere are marked; rows that act in place — the
     * theme switch — are not, which is also what tells the two apart.
     */
    const end = (
        <span className={style.end}>
            {props.value !== undefined && (
                <span className={style.value} suppressHydrationWarning={props.valueIsClientOnly}>
                    {props.value}
                </span>
            )}
            {props.href && <ExternalLinkIcon className={style.icon} aria-hidden="true"/>}
        </span>
    );

    if (props.href) {
        const external = /^https?:/.test(props.href);
        return (
            <a
                draggable={false}
                className={className}
                href={props.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
            >
                <span className={style.label}>{props.label}</span>
                {end}
            </a>
        );
    }

    return (
        <button type="button" className={className} onClick={props.onClick}>
            <span className={style.label}>{props.label}</span>
            {end}
        </button>
    );
}
