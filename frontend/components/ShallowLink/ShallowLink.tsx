import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

type Props = {
    href: string,
    children?: React.ReactNode,
    className?: string,
    'aria-label'?: string
};

/**
 * A `next/link` between the site's two addresses that changes the URL without
 * re-fetching anything.
 *
 * Both live on one route, so React keeps the tree either way — but a normal
 * navigation would still run the page's data fetching and wait for it before
 * the state changed, which is a round trip in the middle of an animation.
 * Shallow skips it. `scroll: false` because opening the shelf is not arriving
 * somewhere new: the page should stay where the reader left it.
 *
 * It stays a real anchor, so middle-click, ctrl-click and "copy link address"
 * all behave, and a visitor with no JS follows it as an ordinary link.
 */
export default function ShallowLink(props: Props) {
    const router = useRouter();

    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        if (event.defaultPrevented || modified || event.button !== 0) {
            return;
        }

        event.preventDefault();
        void router.push(props.href, undefined, {shallow: true, scroll: false});
    };

    return (
        <Link
            href={props.href}
            className={props.className}
            aria-label={props['aria-label']}
            prefetch={false}
            draggable={false}
            onClick={onClick}
        >
            {props.children}
        </Link>
    );
}
