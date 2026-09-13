import {useRef} from 'react';

import Panel from '@/components/Panel/Panel';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import BookCover from '@/components/BookCover/BookCover';
import ExpandToggle from '@/components/ExpandToggle/ExpandToggle';
import BookDialog from '@/components/BookDialog/BookDialog';
import {Book, books} from '@/data/books';
import {classnames} from '@/lib/classnames';
import {bookHref} from '@/lib/bookSlug';
import {useShelfScroll} from './useShelfScroll';

import style from './LibraryPanel.module.scss';

/** The books shown before the shelf is opened, in shelf order. */
const SHELF_BOOK_IDS = [1, 0, 6, 4, 13, 37];

const featured = SHELF_BOOK_IDS
    .map(id => books.find(book => book.id === id))
    .filter(book => book !== undefined);

/** The whole shelf, led by the ones on show so that opening only adds to it. */
const ordered = [...featured, ...books.filter(book => !SHELF_BOOK_IDS.includes(book.id))];

/**
 * The narrowest the shelf ever is, in columns, and so the first book that can
 * ever fall to the second grid. Both grids carry the books in between, and CSS
 * shows each of them in exactly one place — see the stylesheet.
 */
const MIN_COLUMNS = 2;

const preview = ordered.slice(0, SHELF_BOOK_IDS.length);
const rest = ordered.slice(MIN_COLUMNS);

type Props = {
    /** When expanded the panel holds the whole shelf. */
    expanded?: boolean,
    /** The book whose card is open over the shelf, if any. */
    book?: Book | null
};

/**
 * The shelf, in two grids: one that is always on show and one that unfolds.
 *
 * The upper grid holds exactly one row — however many columns the width works
 * out to — so the join between the two is always along a row boundary. That
 * is the whole reason the split is not a fixed six: at four or five columns
 * six books leave a hole in the middle of the shelf, both closed and open.
 *
 * Which books belong to which grid therefore depends on the column count, and
 * only CSS knows that. So both grids carry the handful that can go either way
 * and the stylesheet shows each book in exactly one of them.
 *
 * Every book is in the document in both states. The extra covers on the front
 * page are the price of opening the shelf without watching them arrive.
 */
export default function LibraryPanel(props: Props) {
    const expanded = props.expanded === true;
    const panel = useRef<HTMLElement>(null);

    /* Stacked, the panel's top edge rides up to the top of the screen as the
     * shelf folds, so it does not drift under the reader. */
    useShelfScroll(panel, expanded);

    return (
        <Panel as="section" id="library" className={style.library} ref={panel}>
            <SectionHeading title="Library"/>

            <div className={style.shelfArea}>
                <div className={classnames(style.shelf, style.preview)}>
                    {preview.map(book => (
                        <BookCover key={book.id} book={book} href={bookHref(book)} priority/>
                    ))}
                </div>

                <div className={style.extra} data-open={expanded} inert={!expanded}>
                    <div className={style.extraInner}>
                        <div className={classnames(style.shelf, style.rest)}>
                            {rest.map(book => (
                                <BookCover key={book.id} book={book} href={bookHref(book)} eager/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ExpandToggle
                expanded={expanded}
                href={expanded ? '/' : '/books'}
                region="the shelf"
            />

            {/* Closing goes back to the shelf, not to wherever the reader
              * came from: the card was opened over it and it is still there. */}
            <BookDialog book={props.book ?? null} returnHref="/books"/>
        </Panel>
    );
}
