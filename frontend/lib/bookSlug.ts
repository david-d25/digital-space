import {Book, books} from '@/data/books';

/**
 * Addresses for individual books.
 *
 * The slug comes from the title rather than the id, so a link says what it
 * points at. Ids are the fallback for the rare collision — two editions of
 * the same title, say — which keeps every address unique without making the
 * common one ugly.
 *
 * Built once at module load: eighteen books is not worth recomputing, and a
 * single pass is also what lets collisions be spotted at all.
 */

function slugify(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
}

const byBook = new Map<number, string>();
const bySlug = new Map<string, Book>();

for (const book of books) {
    const base = slugify(book.name);
    const slug = base === '' || bySlug.has(base) ? `${base}-${book.id}` : base;

    byBook.set(book.id, slug);
    bySlug.set(slug, book);
}

export function bookSlug(book: Book): string {
    return byBook.get(book.id) ?? String(book.id);
}

export function bookBySlug(slug: string): Book | null {
    return bySlug.get(slug) ?? null;
}

/** Where a cover leads. The shelf is open behind it either way. */
export function bookHref(book: Book): string {
    return `/books/${bookSlug(book)}`;
}
