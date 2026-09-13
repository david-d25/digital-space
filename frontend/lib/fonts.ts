import localFont from 'next/font/local';
import {Bricolage_Grotesque, DM_Mono, Space_Grotesk} from 'next/font/google';

export const jetBrainsMono = localFont({
    src: [
        { path: '../fonts/JetBrainsMono.woff2', weight: '100 900', style: 'normal' },
        { path: '../fonts/JetBrainsMono-Italic.woff2', weight: '100 900', style: 'italic' },
    ],
    variable: '--jetbrains-mono-font',
    display: 'swap',
});

/** Body and UI text. */
export const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

/** Eyebrows, counters and other small meta text. */
export const dmMono = DM_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono',
    display: 'swap',
});

/** Display type — currently only the name on the intro panel. */
export const bricolageGrotesque = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
});

/** Every font variable, to be put on both `<body>` and the app root. */
export const fontVariables = [
    jetBrainsMono.variable,
    spaceGrotesk.variable,
    dmMono.variable,
    bricolageGrotesque.variable,
].join(' ');
