import {useEffect, useState} from "react";

type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta';

const keyMap: Record<Modifier, string> = {
    ctrl: 'Control',
    shift: 'Shift',
    alt: 'Alt',
    meta: 'Meta',
};

export default function useModifierHeld(modifier: Modifier): boolean {
    const [held, setHeld] = useState(false);

    useEffect(() => {
        const key = keyMap[modifier];
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === key) setHeld(true); };
        const onKeyUp = (e: KeyboardEvent) => { if (e.key === key) setHeld(false); };
        const onBlur = () => setHeld(false);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, [modifier]);

    return held;
}
