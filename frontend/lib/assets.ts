const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Turns a path inside `public/` into a URL that respects the base path. */
export function asset(path: string): string {
    return `${basePath}/${path.replace(/^\//, '')}`;
}
