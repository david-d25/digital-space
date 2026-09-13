export type Project = {
    href: string;
    title: string;
    description: string;
    accent: 'blue' | 'green' | 'orange';
};

/** The one project the section leads with. */
export const featuredProject: Project = {
    href: 'https://github.com/david-d25/kiri',
    title: 'kiri',
    description: 'A self-driving LLM agent that lives in Telegram.',
    accent: 'green',
};

export const projects: Project[] = [
    {
        href: 'https://github.com/david-d25/digital-space',
        title: 'digital-space',
        description: 'This site. A place for projects, notes and a shelf of books.',
        accent: 'blue',
    },
    {
        href: 'https://github.com/david-d25/jutsu-extension',
        title: 'jutsu-extension',
        description: 'A browser extension that makes a streaming site bearable.',
        accent: 'orange',
    },
];
