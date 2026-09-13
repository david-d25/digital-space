import React, {useEffect, useId, useRef} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/router';

import {Book} from '@/data/books';

import style from './BookDialog.module.scss';

type Props = {
    /** The book to show, or null when nothing is open. */
    book: Book | null,
    /** Where closing goes back to. */
    returnHref: string
};

/**
 * One book, over the shelf.
 *
 * A native `<dialog>` opened with `showModal()`, which is worth more here than
 * it looks: it brings the focus trap, Escape, the backdrop and — the reason it
 * settles the question — the top layer. The page is full of `overflow: clip`
 * and `contain: paint` by now, and anything painted in the normal flow would
 * have to dodge all of it.
 *
 * The open book is a real address, so the dialog does not own its own state:
 * it opens because the URL says a book is showing, and closing it navigates
 * rather than setting a flag. Back and forward therefore work by themselves,
 * and a link to a book can be sent to somebody.
 */
export default function BookDialog(props: Props) {
    const router = useRouter();
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    /*
     * Held so the card still has something to draw while it animates out —
     * by then the URL, and so the prop, has already moved on.
     */
    const shown = useRef<Book | null>(props.book);
    if (props.book !== null) {
        shown.current = props.book;
    }

    /* True while we are closing the dialog ourselves, so that the `close`
     * event it fires is not mistaken for the reader dismissing it. */
    const closing = useRef(false);

    useEffect(() => {
        const element = dialog.current;
        if (element === null) {
            return;
        }

        if (props.book !== null && !element.open) {
            closing.current = false;
            element.showModal();
        } else if (props.book === null && element.open) {
            /* Left standing for the handler to clear: `close()` queues its
             * event rather than firing it here, so clearing the flag on the
             * next line would be too early and the handler would navigate
             * again — pushing a duplicate entry and eating the way back. */
            closing.current = true;
            element.close();
        }
    }, [props.book]);

    /* Escape, the backdrop and the button all end up here, because each of
     * them closes the element and the element tells us about it. */
    const onClose = () => {
        if (closing.current) {
            closing.current = false;
            return;
        }
        void router.push(props.returnHref, undefined, {shallow: true, scroll: false});
    };

    const onClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        /* A click that lands on the dialog itself rather than on the card
         * inside it is a click on the backdrop. */
        if (event.target === dialog.current) {
            dialog.current?.close();
        }
    };

    const book = shown.current;
    if (book === null) {
        return null;
    }

    const facts = [
        book.year === null ? null : String(book.year),
        book.language,
        book.edition
    ].filter(fact => fact !== null);

    return (
        <dialog
            ref={dialog}
            className={style.dialog}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={onClick}
        >
            <article className={style.card}>
                <button
                    type="button"
                    className={style.close}
                    onClick={() => dialog.current?.close()}
                    aria-label="Close"
                >
                    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path
                            d="M4 4l8 8M12 4l-8 8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                <div className={style.cover}>
                    <Image
                        src={`/${book.coverImage}`}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 92px, 240px"
                        draggable={false}
                        className={style.coverImage}
                    />
                </div>

                <div className={style.heading}>
                    <h2 id={titleId} className={style.title}>{book.name}</h2>
                    <p className={style.authors}>{book.authors.join(', ')}</p>
                    <p className={style.facts}>
                        <span className={style.status} data-status={book.status}>{book.status}</span>
                        {facts.map(fact => <span key={fact}>{fact}</span>)}
                    </p>
                </div>

                <div className={style.body}>
                    {book.comment !== null && (
                        <p className={style.comment}>{book.comment}</p>
                    )}

                    {book.tags.length > 0 && (
                        <ul className={style.tags}>
                            {book.tags.map(tag => <li key={tag}>{tag}</li>)}
                        </ul>
                    )}

                    {book.isbn !== null && (
                        <p className={style.isbn}>ISBN {book.isbn}</p>
                    )}
                </div>
            </article>
        </dialog>
    );
}
