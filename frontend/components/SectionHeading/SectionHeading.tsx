import React from 'react';
import style from './SectionHeading.module.scss';

type Props = {
    title: string,
    /** Counter or link shown on the opposite side of the heading. */
    meta?: React.ReactNode
};

export default function SectionHeading(props: Props) {
    return (
        <div className={style.root}>
            <div className={style.title}>{props.title}</div>
            {props.meta !== undefined && <div className={style.meta}>{props.meta}</div>}
        </div>
    );
}
