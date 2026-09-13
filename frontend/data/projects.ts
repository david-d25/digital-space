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
        description: 'This site. A place with my projects, books, etc.',
        accent: 'blue',
    },
    {
        href: 'https://github.com/david-d25/jutsu-extension',
        title: 'jutsu-extension',
        description: 'Extension for jut.su that allows to set playback speed, autoskip intro, and autoplay next episode.',
        accent: 'orange',
    },
];
