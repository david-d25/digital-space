import React, {useCallback, useMemo, useState} from 'react';
import Head from 'next/head';

import GlobalBackground from '@/components/SiteBackground/GlobalBackground';
import Container from '@/components/Container/Container';
import Panel from '@/components/Panel/Panel';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Shine from '@/components/Shine/Shine';
import {useTheme} from '@/components/ThemeProvider/ThemeProvider';
import {DEFAULT_SHINE_PARAMS, ShineParams, ShineThemeOptions} from '@/lib/shine';
import {featuredProject, projects} from '@/data/projects';

import style from './shine.module.scss';

/**
 * Playground for the shine: every parameter on a slider, over the real cards
 * and in both themes, which is how the defaults in `DEFAULT_SHINE_PARAMS`
 * were settled.
 *
 * Kept, because tuning the effect again from a diff is far worse than from
 * here — but it is a workshop, not a page of the site, so the route only
 * exists in development (see the bottom of this file).
 */

type Blend = 'overlay' | 'soft-light' | 'plus-lighter' | 'screen';

const BLENDS: {value: Blend, label: string}[] = [
    {value: 'plus-lighter', label: 'plus lighter'},
    {value: 'screen', label: 'screen'},
    {value: 'overlay', label: 'overlay'},
    {value: 'soft-light', label: 'soft light'}
];

/** Everything but the colour, which is picked per theme below. */
type Numeric = Omit<ShineParams, 'color'>;

const {color: _defaultColor, ...DEFAULT_NUMERIC} = DEFAULT_SHINE_PARAMS;

const DEFAULT_COLORS = {light: '#ffffff', dark: '#ffffff'};

/* A couple more cards than the real panel, to see the effect across sizes. */
const EXTRA_CARDS = [
    {
        href: 'https://example.com/one',
        title: 'placeholder-one',
        description: 'Filler, so the grid has a second full row to light.',
        accent: 'green' as const
    },
    {
        href: 'https://example.com/two',
        title: 'placeholder-two',
        description: 'Filler, so the grid has a second full row to light.',
        accent: 'blue' as const
    }
];

export default function ShineLabPage() {
    const {theme, resolved, toggleTheme} = useTheme();

    const [numeric, setNumeric] = useState<Numeric>(DEFAULT_NUMERIC);
    const [colors, setColors] = useState(DEFAULT_COLORS);
    const [blend, setBlend] = useState<Blend>('plus-lighter');
    const [gate, setGate] = useState<'hover' | 'always'>('hover');

    const patch = useCallback((next: Partial<Numeric>) => {
        setNumeric(current => ({...current, ...next}));
    }, []);

    const reset = () => {
        setNumeric(DEFAULT_NUMERIC);
        setColors(DEFAULT_COLORS);
        setBlend('plus-lighter');
    };

    const options = useMemo<ShineThemeOptions>(() => ({
        base: numeric,
        light: {color: colors.light},
        dark: {color: colors.dark}
    }), [numeric, colors]);

    /* The picker edits whichever theme is showing, which is the only way to
     * judge a colour anyway. */
    const dark = theme === 'dark';
    const activeColor = dark ? colors.dark : colors.light;
    const setActiveColor = (value: string) => {
        setColors(current => dark ? {...current, dark: value} : {...current, light: value});
    };

    return <>
        <Head>
            <title>Shine lab</title>
            <meta name="robots" content="noindex"/>
        </Head>

        <GlobalBackground>
            <Container className={style.page}>
                <div className={style.stage}>
                    <Panel as="section" className={style.work}>
                        <SectionHeading
                            title="Highlighted projects"
                            meta={<span className={style.meta}>shine lab</span>}
                        />

                        {/* `ProjectCard` renders an <a> carrying `data-accent`,
                          * and the frosted panel around it does not, so that
                          * picks out the cards; anything else opts in with
                          * `data-shine`, which is what the buttons are for. */}
                        <Shine
                            options={options}
                            gate={gate}
                            blendMode={blend}
                            selector="a[data-accent], [data-shine]"
                        >
                            <ProjectCard {...featuredProject} size="large" className={style.featured}/>
                            <div className={style.grid}>
                                {[...projects, ...EXTRA_CARDS].map(project => (
                                    <ProjectCard key={project.href} {...project}/>
                                ))}
                            </div>

                            <div className={style.actions}>
                                <button type="button" className={style.action} data-shine>
                                    Any button
                                </button>
                                <button
                                    type="button"
                                    className={style.action}
                                    data-shine
                                    data-shine-height="140"
                                >
                                    Pinned to 140
                                </button>
                            </div>
                        </Shine>
                    </Panel>
                </div>

                <Panel as="aside" className={style.controls}>
                    <div className={style.controlsHead}>
                        <div className={style.controlsTitle}>Shine</div>
                    </div>

                    <Segmented label="Blend" value={blend} options={BLENDS} onChange={setBlend}/>

                    <label className={style.control}>
                        <span className={style.controlHead}>
                            <span className={style.controlLabel}>
                                Colour &middot; {dark ? 'dark' : 'light'}
                            </span>
                            <span className={style.controlValue}>{activeColor}</span>
                        </span>
                        <input
                            type="color"
                            className={style.swatch}
                            value={activeColor}
                            onChange={event => setActiveColor(event.target.value)}
                        />
                        <span className={style.hint}>
                            kept per theme; the API takes any CSS colour, custom properties included
                        </span>
                    </label>

                    <Segmented
                        label="Texture"
                        value={numeric.smooth ? 'folds' : 'grain'}
                        options={[
                            {value: 'grain' as const, label: 'grain'},
                            {value: 'folds' as const, label: 'folds'}
                        ]}
                        onChange={value => patch({smooth: value === 'folds'})}
                    />

                    <Slider
                        label="Grain size" hint="one cell in canvas pixels — 1 is a vector per pixel"
                        value={numeric.grainPx} min={1} max={48} step={1}
                        onChange={grainPx => patch({grainPx})}
                    />
                    {numeric.smooth && <Slider
                        label="Octaves" hint="layers of noise, coarse to fine"
                        value={numeric.octaves} min={1} max={4} step={1}
                        onChange={octaves => patch({octaves})}
                    />}
                    <Slider
                        label="Sparkle" hint="exponent — higher is quieter, with rarer, sharper flashes"
                        value={numeric.gamma} min={0.5} max={16} step={0.1}
                        onChange={gamma => patch({gamma})}
                    />
                    <Slider
                        label="Intensity"
                        value={numeric.intensity} min={0} max={2} step={0.01}
                        onChange={intensity => patch({intensity})}
                    />
                    <Slider
                        label="Glow radius" hint="distance at which the light halves — 0 spreads it evenly"
                        value={numeric.falloff} min={0} max={1400} step={10}
                        onChange={falloff => patch({falloff})}
                    />
                    <Slider
                        label="Light height" hint="how far the light floats above a full-width card"
                        value={numeric.height} min={20} max={900} step={5}
                        onChange={height => patch({height})}
                    />
                    <Slider
                        label="Scale to size" hint="0 keeps one height everywhere, 1 makes every element look identical"
                        value={numeric.heightScaling} min={0} max={1} step={0.05}
                        onChange={heightScaling => patch({heightScaling})}
                    />
                    <Slider
                        label="Tilt" hint="how steeply the surface crumples"
                        value={numeric.tilt} min={0.1} max={5} step={0.05}
                        onChange={tilt => patch({tilt})}
                    />
                    <Slider
                        label="Shininess" hint="tightness of the glints"
                        value={numeric.shininess} min={2} max={200} step={1}
                        onChange={shininess => patch({shininess})}
                    />
                    <Slider
                        label="Follow" hint="1 pins the light to the cursor; lower adds lag"
                        value={numeric.ease} min={0.04} max={1} step={0.02}
                        onChange={ease => patch({ease})}
                    />
                    <Slider
                        label="Seed"
                        value={numeric.seed} min={1} max={24} step={1}
                        onChange={seed => patch({seed})}
                    />
                    <Slider
                        label="Render scale" hint="supersampling over the display's own density; the low-power lever"
                        value={numeric.pixelRatio} min={0.4} max={2} step={0.1}
                        onChange={pixelRatio => patch({pixelRatio})}
                    />

                    <Segmented
                        label="Render"
                        value={gate}
                        options={[
                            {value: 'hover' as const, label: 'on hover'},
                            {value: 'always' as const, label: 'always'}
                        ]}
                        onChange={setGate}
                    />

                    <div className={style.buttons}>
                        <button type="button" className={style.button} onClick={toggleTheme}>
                            {!resolved ? 'Toggle theme' : dark ? 'Light theme' : 'Dark theme'}
                        </button>
                        <button type="button" className={style.button} onClick={reset}>
                            Reset
                        </button>
                    </div>

                    <pre className={style.dump}>{JSON.stringify(options, null, 2)}</pre>
                </Panel>
            </Container>
        </GlobalBackground>
    </>;
}

type SliderProps = {
    label: string,
    hint?: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void
};

function Slider(props: SliderProps) {
    return (
        <label className={style.control}>
            <span className={style.controlHead}>
                <span className={style.controlLabel}>{props.label}</span>
                <span className={style.controlValue}>
                    {Math.round(props.value * 1000) / 1000}
                </span>
            </span>
            <input
                type="range"
                className={style.range}
                min={props.min}
                max={props.max}
                step={props.step}
                value={props.value}
                onChange={event => props.onChange(parseFloat(event.target.value))}
            />
            {props.hint !== undefined && <span className={style.hint}>{props.hint}</span>}
        </label>
    );
}

type SegmentedProps<T extends string> = {
    label: string,
    value: T,
    options: readonly {value: T, label: string}[],
    onChange: (value: T) => void
};

function Segmented<T extends string>(props: SegmentedProps<T>) {
    return (
        <div className={style.control}>
            <span className={style.controlHead}>
                <span className={style.controlLabel}>{props.label}</span>
            </span>
            <div className={style.segmented}>
                {props.options.map(option => (
                    <button
                        key={option.value}
                        type="button"
                        className={style.segment}
                        data-active={option.value === props.value}
                        onClick={() => props.onChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/*
 * Nothing links here and the page is `noindex`, but a route that exists is a
 * route that can be found. In production it is simply not there.
 */
export function getServerSideProps() {
    return process.env.NODE_ENV === 'production' ? {notFound: true as const} : {props: {}};
}
