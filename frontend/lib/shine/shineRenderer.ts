/**
 * A frosted-glass shine: a stable random vector per pixel, lit by the pointer.
 *
 * Each pixel carries its own random 2-vector, which tilts an imaginary facet
 * there; the pixel lights up when that facet happens to catch the pointer.
 * The vectors are
 * drawn fresh for every device pixel and held at a very low amplitude — the
 * fine dither that frosted-glass materials such as Windows' acrylic lay over
 * their blur. What keeps that from reading as television static is the
 * amplitude, not any smoothing: a level or two either side of the surface
 * colour is a texture, a full swing is noise.
 *
 * `smooth` interpolates the field between lattice points instead, trading the
 * dither for broad folds. A different material, kept for comparison.
 *
 * Brightness runs through a power curve before distance attenuation, which is
 * what lets the surface stay quiet overall and still throw the odd glint: the
 * exponent crushes the bulk of the grain and spares the pixels aligned with
 * the light.
 *
 * The grain is anchored to the canvas, so it holds still while the page
 * scrolls, and at a render scale of 1 one canvas pixel covers one device
 * pixel — which is what keeps single-pixel grain crisp instead of resampled.
 *
 * The whole thing is one dot product per pixel, which is what a GPU is for.
 * Per frame the main thread writes a handful of uniforms and issues one draw
 * call per lit target; when the pointer leaves, the loop stops and the canvas
 * drops out of compositing, so at rest the effect costs nothing at all.
 */

const VERTEX_SOURCE = `
attribute vec2 aQuad;

uniform vec2 uResolution;
uniform vec4 uRect;

varying vec2 vPixel;
varying vec2 vLocal;

void main() {
    vLocal = aQuad * uRect.zw;
    vPixel = uRect.xy + vLocal;

    /* CSS pixels, y down, to clip space, y up. */
    vec2 clip = (vPixel / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision highp float;

varying vec2 vPixel;
varying vec2 vLocal;

uniform vec4 uRect;
uniform float uCardRadius;

uniform vec2 uLight;
uniform float uHeight;
uniform float uGrainPx;
uniform float uSmooth;
uniform float uOctaves;
uniform float uGamma;
uniform float uIntensity;
uniform float uFalloff;
uniform float uTilt;
uniform float uShininess;
uniform float uSeed;
uniform vec3 uColor;
uniform float uFade;

/* Two uncorrelated values in -1..1 for every lattice point. */
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

/* Value noise: that lattice, smoothstepped between its corners. */
vec2 vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(hash22(i), hash22(i + vec2(1.0, 0.0)), u.x),
        mix(hash22(i + vec2(0.0, 1.0)), hash22(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

/*
 * This pixel's vector, in polar form: angle in x, length in y. Polar rather
 * than a pair of components because the brightness below multiplies the
 * angle, and because drawing an angle and a length separately keeps the
 * distribution the same in every direction — a vector taken from a square is
 * longer on its diagonals, which would make flares commoner whenever the
 * light happened to point that way. The length never exceeds 1, so the
 * response curve has a fixed ceiling to work against.
 */
vec2 field(vec2 p) {
    /* The default: one fresh vector per cell, no interpolation whatsoever.
     * At a grain size of one that is a new vector for every device pixel. */
    if (uSmooth < 0.5) {
        vec2 r = hash22(floor(p)) * 0.5 + 0.5;
        return vec2(r.x * 6.2831853, r.y);
    }

    vec2 sum = vec2(0.0);
    float amplitude = 1.0;
    float total = 0.0;

    for (int i = 0; i < 4; i++) {
        if (float(i) >= uOctaves) break;
        sum += vnoise(p) * amplitude;
        total += amplitude;
        p *= 2.0;
        amplitude *= 0.5;
    }

    vec2 v = sum / max(total, 0.0001);
    float length2 = length(v);

    /* atan is undefined at the origin, and a zero-length vector has no angle
     * worth keeping anyway. */
    return vec2(length2 > 0.0001 ? atan(v.y, v.x) : 0.0, min(length2, 1.0));
}

/*
 * Signed distance to a rounded box, turned into a 2px-soft coverage mask.
 *
 * The radius is clamped to half the shorter side, which is what CSS itself
 * does with one too big to fit: a pill asking for 100px on a box 46px tall is
 * drawn with 23. Without the clamp the formula breaks down — it assumes the
 * straight section it subtracts is not negative — and the mask collapses into
 * a shape pulled in from the real edges.
 */
float roundedMask(vec2 p, vec2 size, float radius) {
    vec2 halfSize = size * 0.5;
    float r = min(radius, min(halfSize.x, halfSize.y));
    vec2 q = abs(p - halfSize) - (halfSize - r);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    return 1.0 - smoothstep(-1.0, 1.0, d);
}

void main() {
    float mask = roundedMask(vLocal, uRect.zw, uCardRadius);
    if (mask <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    /* This pixel's vector. gl_FragCoord is in canvas pixels, so the grain is
     * pinned to the device pixel grid and to the container — it neither
     * crawls as the page scrolls nor resamples into a shimmer. */
    vec2 grain = field(gl_FragCoord.xy / max(uGrainPx, 0.5) + uSeed * 71.3);

    vec2 delta = uLight - vPixel;
    float dist = length(delta);

    /* Glints where the tilted normal happens to bisect the light and the
     * viewer, who is straight ahead. Never negative, so there is no darkening
     * half to discard. */
    vec2 g = vec2(cos(grain.x), sin(grain.x)) * grain.y;
    vec3 l = normalize(vec3(delta, uHeight));
    vec3 n = normalize(vec3(g * uTilt, 1.0));
    vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
    float shine = pow(max(dot(n, h), 0.0), uShininess);

    /* The response curve, and the reason the effect can be quiet and still
     * have highlights. Both the grain and the dot product sit near zero for
     * most pixels, so raising the whole thing to a power crushes that bulk
     * towards nothing while leaving the few pixels that line up with the
     * light almost untouched: an even shimmer becomes occasional glints.
     *
     * It runs before the attenuation, so how rare a flare is stays the same
     * across the card and only its brightness falls away with distance. */
    shine = pow(shine, uGamma) * uIntensity;

    if (uFalloff > 0.0) {
        float d = dist / uFalloff;
        shine /= 1.0 + d * d;
    }

    /*
     * Written as coverage, not as an opaque fill: white where the light
     * lands, black where it is taken away, and an alpha that says how much.
     *
     * Filling the whole element at alpha 1 and carrying the effect in the
     * colour looks the same over anything opaque, and is wrong over anything
     * that is not. A source at alpha 1 owns every pixel it covers, so the
     * part of the backdrop that was see-through gets replaced by the source
     * colour, and the group is handed on as fully opaque. On these panels,
     * where a card at a tenth alpha sits over a panel at four fifths, that
     * showed up as the element going flatly darker, or flatly lighter, the
     * moment the canvas appeared.
     *
     * On an opaque backdrop the two are algebraically the same. For a dark
     * one, overlay of mid-grey-plus-half-shine gives Cb*(1+shine), and so
     * does white at alpha shine; the light case and the darkening half work
     * out the same way, and the additive modes add the identical
     * premultiplied value. So nothing about the tuned look changes — only
     * the transparency stops being fabricated.
     *
     * The fade rides this same alpha. That also keeps the canvas from
     * standing there fully opaque at the end of a fade and then vanishing,
     * which is what made the last frame of the old fade visibly step.
     */
    float alpha = mask * uFade * min(shine, 1.0);
    gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

/** Colour of the glints, as sRGB components in 0..1. */
export type ShineColor = readonly [number, number, number];

export type ShineParams = {
    /** Size of one noise cell in canvas pixels. 1 is a vector per pixel. */
    grainPx: number,
    /** Interpolate between cells, turning the dither into broad folds. */
    smooth: boolean,
    /** Layers of noise. Only meaningful while `smooth` is on. */
    octaves: number,
    /**
     * Height of the light above an element whose diagonal is 900 CSS px, in
     * CSS px. Smaller elements scale it down by `heightScaling`.
     */
    height: number,
    /**
     * How far the light height follows the element's size, as an exponent on
     * the size ratio. 0 keeps the same absolute height everywhere, which
     * leaves small elements sitting entirely under the light with no gradient
     * across them; 1 makes every element geometrically identical, which
     * scales the effect onto a button whole. In between is usually what looks
     * right. A single element can opt out with `data-shine-height`.
     */
    heightScaling: number,
    /**
     * Exponent on the brightness. 1 is linear; the higher it goes the quieter
     * the surface sits and the rarer — and sharper — the flares become.
     */
    gamma: number,
    intensity: number,
    /** Distance in CSS px at which the glow halves. 0 spreads it evenly. */
    falloff: number,
    /** How far the normals tilt off the surface. */
    tilt: number,
    /** Tightness of the glints. */
    shininess: number,
    /**
     * What colour the glints are. The blend mode decides how it lands: the
     * additive modes add it outright, so a tint reads as tinted sparks, while
     * the multiplying ones use it as a ceiling to pull the surface towards.
     */
    color: ShineColor,
    seed: number,
    /**
     * Fraction of the display's own pixel ratio. At 1 the canvas matches the
     * device pixel grid, which single-pixel grain needs to stay crisp; below
     * that it is upscaled, which is the low-power path.
     */
    pixelRatio: number,
    /**
     * Fraction of the remaining distance the light covers per frame; 1 pins
     * it to the pointer with no lag at all.
     */
    ease: number
};

/**
 * Settled by eye in the playground. A sparse, fine glitter that shifts as the
 * pointer moves and lights the element evenly rather than pooling under the
 * cursor — the light sits far enough above the surface (900 against a card a
 * couple of hundred wide) that its direction barely changes across one, and
 * the glow radius is off.
 */
export const DEFAULT_SHINE_PARAMS: ShineParams = {
    grainPx: 1,
    smooth: false,
    /* Unused while `smooth` is off. */
    octaves: 3,
    height: 900,
    heightScaling: 0.5,
    gamma: 4,
    intensity: 0.15,
    falloff: 0,
    tilt: 0.8,
    shininess: 100,
    color: [1, 1, 1],
    seed: 1,
    /* Above 1 the grain is finer than the display and averages down into it. */
    pixelRatio: 1.5,
    ease: 1
};

/** One lit rectangle, in CSS pixels relative to the container. */
export type ShineCard = {
    /**
     * The element this rectangle came from, used as its identity and nothing
     * else. Targets are kept in a list, and a list position is not stable:
     * remove one from the middle and every later index shifts onto its
     * neighbour, which would hand a half-lit target's fade to the wrong
     * element. Keying on the element itself survives any reordering.
     */
    element: Element,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    /** Diagonal in CSS px, which is what the light height is scaled against. */
    diagonal: number,
    /**
     * An absolute light height for this one element, from `data-shine-height`,
     * overriding whatever the scaling would have worked out. Null to let the
     * scaling decide.
     */
    lightHeight: number | null
};

type Uniforms = Record<string, WebGLUniformLocation | null>;

const UNIFORM_NAMES = [
    'uResolution', 'uRect', 'uCardRadius', 'uLight', 'uHeight', 'uGrainPx',
    'uSmooth', 'uOctaves', 'uGamma', 'uIntensity', 'uFalloff', 'uTilt',
    'uShininess', 'uSeed', 'uColor', 'uFade'
];

/** How long a target takes to light up, and to go dark again. */
const FADE_MS = 200;

/**
 * The diagonal, in CSS pixels, at which `height` is taken at face value.
 * About that of a card spanning the content column, which is what the
 * defaults were tuned against.
 */
const REFERENCE_DIAGONAL = 900;

/** Pointer movement below this is not worth a redraw. */
const STILL_EPSILON = 0.01;

/**
 * Ceilings on the drawing buffer, in pixels a side and in pixels total.
 *
 * The surface costs four bytes a pixel of GPU memory, and a driver that
 * cannot allocate one loses the context rather than handing back something
 * smaller — so a tall region on a dense screen has to be scaled down here
 * instead. Both are well under what desktop drivers report; the point is the
 * memory, not the hardware limit. Drawing short only coarsens the grain,
 * since the canvas is stretched over its box at whatever size it is drawn.
 */
const MAX_CANVAS_SIDE = 8192;
const MAX_CANVAS_PIXELS = 16e6;

export class ShineRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGLRenderingContext;
    /* Rebuilt from scratch if the context is ever lost and comes back, so
     * none of these can be readonly. Null means there is nothing to draw
     * with at the moment. */
    private program: WebGLProgram | null = null;
    private buffer: WebGLBuffer | null = null;
    private uniforms: Uniforms = {};
    private lost = false;

    private params: ShineParams = DEFAULT_SHINE_PARAMS;
    private cards: ShineCard[] = [];
    private width = 0;
    private height = 0;

    private pointerX = 0;
    private pointerY = 0;
    private lightX = 0;
    private lightY = 0;
    private placed = false;

    /**
     * Which target the pointer is on, `all` for the tuning mode that lights
     * every one, or null for none.
     */
    private hovered: Element | 'all' | null = null;

    /** One 0..1 fade per target, so they light and dim independently. */
    private fades = new Map<Element, number>();
    private lastFrame = 0;

    /**
     * The last value written to the canvas's inline style.
     *
     * Writing it unconditionally is a mutation of a `style` attribute, and
     * the overlay above watches this subtree for exactly that - so a draw
     * would schedule a re-measure, a re-measure marks the renderer dirty,
     * and the dirty renderer draws again. A loop at frame rate, doing a
     * full measure and a GL pass each time round, out of nothing at all.
     */
    private shownOpacity = '';
    private readonly fadeMs: number;

    /** Something has changed that the frame on screen does not yet reflect. */
    private dirty = true;

    /** The driver's own ceiling, read once the context exists. */
    private maxSide = MAX_CANVAS_SIDE;

    private raf = 0;
    private frames = 0;
    private fpsSince = 0;
    private destroyed = false;

    /** Reports the measured frame rate a couple of times a second. */
    onFps: ((fps: number) => void) | null = null;

    private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        this.canvas = canvas;
        this.gl = gl;

        if (!this.buildGlState()) {
            throw new Error('shine: could not set up the context');
        }

        canvas.addEventListener('webglcontextlost', this.onContextLost);
        canvas.addEventListener('webglcontextrestored', this.onContextRestored);

        const still = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.fadeMs = still ? 0 : FADE_MS;
    }

    /**
     * Everything that lives inside the GL context: the program, the quad, the
     * uniform locations and the fixed state. All of it dies with the context,
     * so it is here rather than inline in the constructor, ready to be run
     * again if the context comes back.
     */
    private buildGlState(): boolean {
        const gl = this.gl;

        const limit = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number;
        this.maxSide = Math.min(MAX_CANVAS_SIDE, limit > 0 ? limit : MAX_CANVAS_SIDE);

        const program = buildProgram(gl);
        if (program === null) {
            return false;
        }

        const buffer = gl.createBuffer();
        if (buffer === null) {
            gl.deleteProgram(program);
            return false;
        }

        this.program = program;
        this.buffer = buffer;
        this.uniforms = {};

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

        const quad = gl.getAttribLocation(program, 'aQuad');
        gl.enableVertexAttribArray(quad);
        gl.vertexAttribPointer(quad, 2, gl.FLOAT, false, 0, 0);

        for (const name of UNIFORM_NAMES) {
            this.uniforms[name] = gl.getUniformLocation(program, name);
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        return true;
    }

    /*
     * A context can go at any time — the driver resets, the laptop sleeps, or
     * the page opens a seventeenth canvas and the browser reclaims the oldest.
     * Without this the effect would simply stop for good, silently, until the
     * page was reloaded.
     *
     * Preventing the default on the loss event is what makes the browser
     * willing to hand a restored one back.
     */
    private readonly onContextLost = (event: Event): void => {
        event.preventDefault();
        this.lost = true;
        this.program = null;
        this.buffer = null;

        if (this.raf !== 0) {
            cancelAnimationFrame(this.raf);
            this.raf = 0;
        }
    };

    private readonly onContextRestored = (): void => {
        if (this.destroyed) {
            return;
        }

        this.lost = false;
        if (!this.buildGlState()) {
            return;
        }

        /* The buffer comes back cleared, so whatever was on screen is gone
         * and the next frame has to redraw it from scratch. */
        this.applySize();
        this.dirty = true;
        this.wake();
    };

    /** Null when the browser has no WebGL to give, in which case: no effect. */
    static create(canvas: HTMLCanvasElement): ShineRenderer | null {
        const gl = canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            /* A card decoration is not worth waking a discrete GPU for. */
            powerPreference: 'low-power'
        });

        if (gl === null) {
            return null;
        }

        try {
            return new ShineRenderer(canvas, gl);
        } catch {
            return null;
        }
    }

    setParams(params: ShineParams): void {
        const resized = params.pixelRatio !== this.params.pixelRatio;
        this.params = params;
        if (resized) {
            this.applySize();
        }
        this.dirty = true;
        this.wake();
    }

    setCards(cards: ShineCard[]): void {
        this.cards = cards;

        /* Re-measuring must not disturb a fade already under way, so values
         * are kept for targets that are still here and dropped for the ones
         * that have gone. An element that leaves the document cannot be lit
         * on the way out, so its fade goes with it. */
        const live = new Set(cards.map(card => card.element));
        for (const element of this.fades.keys()) {
            if (!live.has(element)) {
                this.fades.delete(element);
            }
        }

        /* Unmounting whatever was under the pointer leaves nothing lit,
         * rather than the light jumping to whichever element inherited the
         * position. */
        if (this.hovered !== null && this.hovered !== 'all' && !live.has(this.hovered)) {
            this.hovered = null;
        }

        this.dirty = true;
        this.wake();
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.applySize();
        this.dirty = true;
        this.wake();
    }

    /** Pointer position in CSS pixels relative to the container. */
    setPointer(x: number, y: number): void {
        this.pointerX = x;
        this.pointerY = y;

        /* The first reading places the light rather than easing towards it,
         * so it does not come flying in from the corner. */
        if (!this.placed) {
            this.placed = true;
            this.lightX = x;
            this.lightY = y;
        }

        this.wake();
    }

    /**
     * Which target is under the pointer, by index; null for none, `all` to
     * light every one at once. Each target travels to its own destination, so
     * one can be going dark while the next comes up.
     */
    setHovered(hovered: Element | 'all' | null): void {
        if (this.hovered === hovered) {
            return;
        }

        this.hovered = hovered;
        this.dirty = true;
        this.wake();
    }

    /** True while a target is showing, so the canvas can be taken out of
     * compositing entirely when none is. */
    private get anyLit(): boolean {
        for (const fade of this.fades.values()) {
            if (fade > 0) {
                return true;
            }
        }
        return false;
    }

    destroy(): void {
        this.destroyed = true;
        if (this.raf !== 0) {
            cancelAnimationFrame(this.raf);
            this.raf = 0;
        }

        /* The context itself is deliberately left alone. A canvas hands back
         * the same context object for its whole life, so forcing the loss
         * here would hand a dead one to the next renderer mounted on the same
         * element — which is every remount in development. Dropping the
         * resources is enough; the context goes when the canvas does. */
        this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);

        const gl = this.gl;
        if (this.buffer !== null) {
            gl.deleteBuffer(this.buffer);
        }
        if (this.program !== null) {
            gl.deleteProgram(this.program);
        }
        this.buffer = null;
        this.program = null;
    }

    private applySize(): void {
        /* Relative to the display: the grain wants one canvas pixel per
         * device pixel, so the slider scales that rather than replacing it. */
        const density = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
        const ratio = Math.max(0.1, this.params.pixelRatio) * density;

        /* Kept inside the ceilings above, uniformly so the aspect holds. */
        const longest = Math.max(this.width, this.height, 1) * ratio;
        const area = Math.max(this.width * this.height, 1) * ratio * ratio;
        const scale = Math.min(
            1,
            this.maxSide / longest,
            Math.sqrt(MAX_CANVAS_PIXELS / area)
        );

        const width = Math.max(1, Math.round(this.width * ratio * scale));
        const height = Math.max(1, Math.round(this.height * ratio * scale));

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    private wake(): void {
        if (this.destroyed || this.lost || this.raf !== 0) {
            return;
        }
        this.fpsSince = 0;
        this.frames = 0;
        this.raf = requestAnimationFrame(this.tick);
    }

    private readonly tick = (now: number): void => {
        this.raf = 0;
        if (this.destroyed || this.lost || this.program === null) {
            return;
        }

        const ease = this.params.ease;
        const dx = this.pointerX - this.lightX;
        const dy = this.pointerY - this.lightY;
        this.lightX += dx * ease;
        this.lightY += dy * ease;

        const moving = Math.abs(dx) > STILL_EPSILON || Math.abs(dy) > STILL_EPSILON;
        const fading = this.advanceFades(now);

        /* Nothing moved, nothing is fading, nothing changed: the frame on
         * screen is already correct, so stop scheduling. The next pointer
         * event or parameter change wakes the loop again, which makes resting
         * on a card — and sitting with the pointer away — cost nothing. */
        if (!this.dirty && !moving && !fading) {
            this.lastFrame = 0;
            this.onFps?.(0);
            return;
        }

        this.draw();
        this.dirty = false;

        this.frames++;
        if (this.fpsSince === 0) {
            this.fpsSince = now;
        } else if (now - this.fpsSince >= 500) {
            this.onFps?.((this.frames * 1000) / (now - this.fpsSince));
            this.frames = 0;
            this.fpsSince = now;
        }

        this.raf = requestAnimationFrame(this.tick);
    };

    /**
     * Walks every target's fade towards where it should be and says whether
     * any is still travelling.
     *
     * Stepped by elapsed time rather than a fixed slice per frame, so the
     * duration holds whether the display runs at 60Hz or 240Hz. A long gap is
     * clamped: coming back from a stall should finish the fade, not teleport
     * past it.
     */
    private advanceFades(now: number): boolean {
        const elapsed = this.lastFrame === 0 ? 16 : Math.min(now - this.lastFrame, 100);
        this.lastFrame = now;

        const step = this.fadeMs > 0 ? elapsed / this.fadeMs : 1;
        let travelling = false;

        for (const card of this.cards) {
            const target = this.hovered === 'all' || this.hovered === card.element ? 1 : 0;
            const current = this.fades.get(card.element) ?? 0;
            if (current === target) {
                continue;
            }

            const next = target > current
                ? Math.min(target, current + step)
                : Math.max(target, current - step);

            this.fades.set(card.element, next);
            if (next !== target) {
                travelling = true;
            }
        }

        return travelling;
    }

    /**
     * The light height for one target. Scaling it by the element's own size
     * is what keeps a small button from sitting wholly under the light with
     * no gradient across it, and the exponent is what stops that scaling from
     * shrinking the effect onto the button whole.
     */
    private lightHeightFor(card: ShineCard): number {
        if (card.lightHeight !== null) {
            return card.lightHeight;
        }

        const ratio = card.diagonal / REFERENCE_DIAGONAL;
        return this.params.height * Math.pow(ratio, this.params.heightScaling);
    }

    private draw(): void {
        const gl = this.gl;
        const u = this.uniforms;
        const p = this.params;

        if (this.program === null) {
            return;
        }

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);

        gl.uniform2f(u.uResolution, this.width, this.height);
        gl.uniform2f(u.uLight, this.lightX, this.lightY);
        gl.uniform1f(u.uGrainPx, p.grainPx);
        gl.uniform1f(u.uSmooth, p.smooth ? 1 : 0);
        gl.uniform1f(u.uOctaves, p.octaves);
        gl.uniform1f(u.uGamma, p.gamma);
        gl.uniform1f(u.uIntensity, p.intensity);
        gl.uniform1f(u.uFalloff, p.falloff);
        gl.uniform1f(u.uTilt, p.tilt);
        gl.uniform1f(u.uShininess, p.shininess);
        gl.uniform1f(u.uSeed, p.seed);
        gl.uniform3f(u.uColor, p.color[0], p.color[1], p.color[2]);

        /* One quad per lit target. Half a dozen draw calls is cheaper to
         * set up than a uniform array the shader would have to loop over for
         * every pixel. */
        for (const card of this.cards) {
            const fade = this.fades.get(card.element) ?? 0;
            if (fade <= 0) {
                continue;
            }

            gl.uniform1f(u.uFade, fade);
            gl.uniform1f(u.uHeight, this.lightHeightFor(card));
            gl.uniform4f(u.uRect, card.x, card.y, card.width, card.height);
            gl.uniform1f(u.uCardRadius, card.radius);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        /*
         * With nothing lit the canvas holds nothing but transparency, and a
         * blended layer still costs the compositor something, so take it out
         * of the picture rather than leave it there empty.
         *
         * Safe to flip now only because the fade rides the alpha: by the
         * time every target reads zero the canvas is already writing nothing,
         * so removing it changes nothing on screen. Were the fade scaling the
         * colour instead, a fully opaque layer would still be lying there at
         * the end and taking it away would show as a step.
         */
        const opacity = this.anyLit ? '1' : '0';
        if (opacity !== this.shownOpacity) {
            this.shownOpacity = opacity;
            this.canvas.style.opacity = opacity;
        }
    }
}

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    if (vertex === null || fragment === null) {
        return null;
    }

    const program = gl.createProgram();
    if (program === null) {
        return null;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('shine: link failed', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (shader === null) {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('shine: compile failed', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
