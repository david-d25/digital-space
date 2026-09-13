import GlobalBackground from '@/components/SiteBackground/GlobalBackground';
import Container from '@/components/Container/Container';
import IntroPanel from '@/components/IntroPanel/IntroPanel';
import WorkPanel from '@/components/WorkPanel/WorkPanel';
import LibraryPanel from '@/components/LibraryPanel/LibraryPanel';
import {Book} from '@/data/books';

import style from './SiteShell.module.scss';

/** Which panel, if any, has taken over the page. */
export type ExpandedPanel = 'library' | null;

type Props = {
    expanded?: ExpandedPanel,
    /** The book whose card is open over the shelf, if any. */
    book?: Book | null
};

/**
 * The page itself. Both routes render this same tree and only differ in which
 * panel is expanded, so opening the shelf is a state change in a tree that
 * stays mounted — no snapshots, no second DOM, nothing to photograph.
 *
 * The work panel folds away when the shelf opens. It sits above the shelf, so
 * folding it pulls a thousand pixels out from over the reader's head; what
 * keeps the page still under them is the browser's own scroll anchoring,
 * helped along by `overflow-anchor: none` on the folding box so that the
 * anchor is never chosen from inside the thing that is disappearing.
 *
 * The intro panel does not fold. There is room for it beside the shelf, and
 * stacked it sits above everything — folding that away too would be a second
 * shift in the same frame, with nothing gained.
 */
export default function SiteShell(props: Props) {
    const expanded = props.expanded ?? null;
    const collapsed = expanded !== null;

    return (
        <GlobalBackground>
            <Container className={style.content}>
                <IntroPanel/>

                <div className={style.main}>
                    <div
                        className={style.workSlot}
                        data-collapsed={collapsed}
                        inert={collapsed}
                    >
                        <div className={style.workInner}>
                            <WorkPanel/>
                        </div>
                    </div>

                    <LibraryPanel expanded={expanded === 'library'} book={props.book ?? null}/>

                    <div className={style.footer}>
                        <span>&copy; {new Date().getFullYear()} David</span>
                    </div>
                </div>
            </Container>
        </GlobalBackground>
    );
}
