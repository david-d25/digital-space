import style from './Button.module.scss'
import React, {MouseEventHandler} from "react";
import {classnames} from "@/lib/classnames";

type Props = {
    children?: React.ReactNode,
    disabled?: boolean,
    noStyle?: boolean,
    noPadding?: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    ref?: React.Ref<HTMLButtonElement>,
    className?: string
    type?: 'button' | 'submit' | 'reset'
    colorAccent?: 'primary' | 'default'
    tabIndex?: number
};

export default function Button(props: Props) {
    const className = classnames(
        {
            [style.button]: true,
            [style.noStyle]: props.noStyle,
            [style.noPadding]: props.noPadding,
        },
        props.className
    );
    const colorAccent = props.colorAccent || 'default';
    return (
        <button
            type={props.type || 'button'}
            tabIndex={props.tabIndex}
            className={className}
            onClick={props.onClick}
            disabled={props.disabled}
            ref={props.ref}
            data-color-accent={colorAccent}
        >
            {props.children}
        </button>
    )
}