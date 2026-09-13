import React from 'react';
import Panel from '@/components/Panel/Panel';
import ExternalLinkIcon from '@/icons/external-link.svg';
import style from './ProjectCard.module.scss';
import {classnames} from '@/lib/classnames';

type Props = {
    href: string,
    title: string,
    description: string,
    accent?: 'none' | 'blue' | 'green' | 'orange',
    /** `large` is the single highlighted project at the top of the section. */
    size?: 'regular' | 'large',
    className?: string
};

export default function ProjectCard(props: Props) {
    const large = props.size === 'large';
    return (
        <Panel
            variant="card"
            accent={props.accent}
            size={props.size}
            href={props.href}
            className={classnames({[style.card]: true, [style.large]: large}, props.className)}
        >
            <div className={style.source}>
                <span>GitHub</span>
                <ExternalLinkIcon className={style.icon} aria-hidden="true"/>
            </div>
            <div className={style.title}>{props.title}</div>
            <div className={style.description}>{props.description}</div>
        </Panel>
    );
}
