import React from 'react';
import Image from 'next/image';
import ShallowLink from '@/components/ShallowLink/ShallowLink';
import style from './BookCover.module.scss';
import {Book} from '@/data/books';

const COVER_SIZES = '150px';

type Props = {
    book: Book,
    /** Where the cover leads. Omitted on the full shelf: nowhere left to go. */
    href?: string,
    /** Set for the covers above the fold: one of them is the page's LCP. */
    priority?: boolean,
    /**
     * Fetch even though the cover is not on screen. For the folded part of
     * the shelf, which is clipped to nothing and so never intersects the
     * viewport: left lazy it would only start loading as it opened, and the
     * reader would watch the shelf fill in.
     */
    eager?: boolean
};

export default function BookCover(props: Props) {
    const content = <>
        <div className={style.coverBox}>
            <Image
                className={style.cover}
                src={`/${props.book.coverImage}`}
                alt={props.book.name}
                fill
                sizes={COVER_SIZES}
                draggable={false}
                priority={props.priority}
                loading={props.eager === true ? 'eager' : undefined}
                fetchPriority={props.eager === true ? 'low' : undefined}
            />
        </div>
        <div className={style.title}>{props.book.name}</div>
    </>;

    if (!props.href) {
        return <div className={style.item}>{content}</div>;
    }

    return (
        <ShallowLink className={style.item} href={props.href}>
            {content}
        </ShallowLink>
    );
}
