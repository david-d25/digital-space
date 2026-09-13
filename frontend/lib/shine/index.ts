/**
 * The shine effect: a fine frosted-glass grain that catches the pointer.
 *
 * Mount one `Shine` around a region and mark the elements inside it:
 *
 *     const shine = useShineTarget();
 *
 *     <Shine options={{base: {intensity: 0.15}, light: {color: '#7aa2ff'}}}>
 *         <Panel ref={shine}>…</Panel>
 *         <button data-shine>Press me</button>
 *     </Shine>
 *
 * `ShineTarget` wraps a child instead, for targets written in a loop where a
 * hook cannot be called per item. Both report the unmount exactly, which a
 * mutation observer only notices a frame later. `data-shine` and `selector`
 * stay for plain markup.
 *
 * Everything below is for callers that need the pieces directly — the
 * renderer for a non-React host, the defaults for building a settings UI.
 */

export {
    ShineRenderer,
    DEFAULT_SHINE_PARAMS,
    type ShineParams,
    type ShineColor,
    type ShineCard
} from './shineRenderer';

export {default as ShineTarget} from '@/components/Shine/ShineTarget';

export {
    ShineRegistry,
    ShineContext,
    useShineTarget,
    type ShineTargetOptions
} from '@/components/Shine/ShineRegistry';

export {
    resolveShineParams,
    resolveShineColor,
    shineParamsEqual,
    type ShineOptions,
    type ShineThemeOptions,
    type ResolvedTheme
} from './options';
