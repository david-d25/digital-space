import Head from 'next/head';
import {useRouter} from 'next/router';
import type {GetServerSideProps} from 'next';

import SiteShell, {ExpandedPanel} from '@/components/SiteShell/SiteShell';
import {Book} from '@/data/books';
import {bookBySlug} from '@/lib/bookSlug';

/**
 * Every address of the site, served by one page.
 *
 * `/`, `/books` and `/books/<slug>` show the same tree — the second has the
 * library open, the third also has a book showing — so they are one route
 * rather than three. That is the whole point: a second page file would be a
 * second component, React would unmount one and mount the other, and opening
 * the shelf would mean rebuilding the DOM instead of animating it.
 *
 * A catch-all matches anything, so anything that is not one of these is a 404
 * below. Static routes still win over it, so `/lab/shine` is untouched.
 */

const SITE = "David's Digital Space";

type Route = {
    expanded: ExpandedPanel,
    book: Book | null,
    title: string,
    description: string
};

function resolve(path: string): Route | null {
    if (path === '') {
        return {
            expanded: null,
            book: null,
            title: SITE,
            description: 'Java & Web developer. Projects, notes and a shelf of books.'
        };
    }

    if (path === 'books') {
        return {
            expanded: 'library',
            book: null,
            title: `Library — ${SITE}`,
            description: 'Books David has read, is reading, or keeps on the shelf.'
        };
    }

    if (path.startsWith('books/')) {
        const book = bookBySlug(path.slice('books/'.length));
        if (book === null) {
            return null;
        }

        return {
            expanded: 'library',
            book,
            title: `${book.name} — ${SITE}`,
            /* The note is the reason the page exists; the rest is the label. */
            description: book.comment
                ?? `${book.name} by ${book.authors.join(', ')}, on David's shelf.`
        };
    }

    return null;
}

function pathOf(slug: string | string[] | undefined): string {
    return Array.isArray(slug) ? slug.join('/') : slug ?? '';
}

export default function SitePage() {
    const router = useRouter();

    /*
     * Read from the router rather than from props, because moving between
     * these addresses on the client is shallow: the URL and the query change,
     * no data is fetched, and this is what tells us about it.
     */
    const route = resolve(pathOf(router.query.slug)) ?? resolve('')!;

    return <>
        <Head>
            <title>{route.title}</title>
            <meta name="description" content={route.description}/>
        </Head>
        <SiteShell expanded={route.expanded} book={route.book}/>
    </>;
}

export const getServerSideProps: GetServerSideProps = async context => {
    const route = resolve(pathOf(context.params?.slug));
    return route === null ? {notFound: true} : {props: {}};
};
