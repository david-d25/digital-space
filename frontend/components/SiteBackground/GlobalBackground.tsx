import React from 'react';
import style from './GlobalBackground.module.scss';
import {classnames} from '@/lib/classnames';

type Props = {
    children?: React.ReactNode,
    className?: string
};

/**
 * Paints the page background — two blurred blobs, three hard shapes and a dot
 * grid over both — and puts the content above it. The scenery is static for
 * now.
 */
export default function GlobalBackground(props: Props) {
    return (
        <div className={classnames(style.root, props.className)}>
            <div className={style.scenery} aria-hidden="true">
                <div className={style.blobs}>
                    <div className={classnames(style.blob, style.blobOne)}/>
                    <div className={classnames(style.blob, style.blobTwo)}/>
                </div>
                <div className={style.shapes}>
                    <div className={style.shapesInner}>
                        <div className={style.ring}/>
                        <div className={style.teardrop}/>
                        <div className={style.pill}/>
                    </div>
                </div>
                <div className={style.dots}/>
            </div>
            <div className={style.content}>
                {props.children}
            </div>
        </div>
    );
}
