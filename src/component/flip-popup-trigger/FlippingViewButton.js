import React, {useEffect, useMemo, useRef, useState} from "react";

import styles from './FlippingViewButton.module.scss';
import {cubicBezier, lerp} from "@/util/Math";

import returnIcon from '@/icon/return.svg';

const animationDurationMillis = 500;

export default function FlippingViewButton(props) {
    const targetEl = props.children || <></>;
    const onClose = props['onClose'] || null;
    const popupContent = props['popupContent'];
    const open = props['open'] || false;

    const prevOpen = useRef(false);
    const [popupBounds, setPopupBounds] = useState(0);
    const [flippingElementBoundsProvider, setFlippingElementBoundsProvider] = useState(null);
    const savedFlippingElementBounds = useRef(null);

    const [flipFactor, setFlipFactor] = useState(0);

    const animationStartTimeRef = useRef(null);
    const animationFrameId = useRef();
    const inAnimation = useRef(false);

    useEffect(() => {
        if (open && !prevOpen.current && flippingElementBoundsProvider) {
            savedFlippingElementBounds.current = flippingElementBoundsProvider();
        }
        prevOpen.current = open;
    }, [open]);

    const animate = (time) => {
        if (!animationStartTimeRef.current) {
            animationStartTimeRef.current = time;
        }
        const elapsedTime = time - animationStartTimeRef.current;
        const progress = elapsedTime / animationDurationMillis;
        const newFlipFactor = open ? progress : 1 - progress;
        if (progress < 1) {
            setFlipFactor(cubicBezier(newFlipFactor, 0.75, 0, 0.25, 1));
            animationFrameId.current = requestAnimationFrame(animate);
        } else {
            setFlipFactor(open ? 1 : 0);
            animationFrameId.current = null;
            animationStartTimeRef.current = null;
            inAnimation.current = false;
        }
    };

    if ((open && flipFactor === 0 || !open && flipFactor === 1) && !inAnimation.current) {
        inAnimation.current = true;
        requestAnimationFrame(animate);
    }

    return (
        <>
            <FlippingElement flipFactor={flipFactor}
                             popupBounds={popupBounds}
                             onDeclareFlippingElementBoundsProvider={setFlippingElementBoundsProvider}>
                {targetEl}
            </FlippingElement>
            <FlipPopup open={open}
                       flipFactor={flipFactor}
                       onClose={onClose}
                       onDeclareBounds={setPopupBounds}
                       flippingElementBounds={savedFlippingElementBounds.current}>
                {popupContent}
            </FlipPopup>
        </>
    );
}

function FlippingElement(props) {
    const popupBounds = props['popupBounds'] || 0;
    const onDeclareFlippingElementBoundsProvider = props['onDeclareFlippingElementBoundsProvider'] || (() => {});
    const flipFactor = props['flipFactor'];

    const ref = useRef();
    const [restingBounds, setRestingBounds] = useState(null);

    function updateRestingBounds() {
        if (flipFactor === 0 && ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            setRestingBounds(bounds);
            return bounds;
        }
        return null;
    }

    useEffect(() => {
        onDeclareFlippingElementBoundsProvider(() => () => updateRestingBounds());
    }, []);

    useEffect(() => {
        if (ref.current) {
            updateRestingBounds();
            const observer = new ResizeObserver(updateRestingBounds);
            observer.observe(ref.current);
            return observer.detach;
        }
    }, [flipFactor]);

    const style = {};

    if (flipFactor !== 0 && ref.current && popupBounds) {
        const pageCenter = [popupBounds.left + popupBounds.width/2, popupBounds.top + popupBounds.height/2];
        const triggerCenter = [restingBounds.left + restingBounds.width/2, restingBounds.top + restingBounds.height/2];
        const offset = [pageCenter[0] - triggerCenter[0], pageCenter[1] - triggerCenter[1]];
        const triggerHeight = ref.current.offsetHeight;
        const targetTriggerScale = popupBounds.height/triggerHeight;

        const tx = flipFactor * offset[0];
        const ty = flipFactor * offset[1];
        const angle = flipFactor * Math.PI;
        const scale = lerp(1, targetTriggerScale, flipFactor);
        if (flipFactor < 0.5) {
            style.transform = `translate3d(${tx}px, ${ty}px, 0px) scale(${scale}) perspective(1500px) rotateY(${angle}rad)`;
            style.zIndex = '1';
            style.visibility = null;
        } else {
            style.transform = null;
            style.zIndex = null;
            style.visibility = 'hidden';
        }
    }

    return (
        <div ref={ref} style={style}>
            {props.children}
        </div>
    )
}

function FlipPopup(props) {
    const open = props['open'];
    const flipFactor = props['flipFactor'];
    const onClose = props['onClose'] || ((e) => { e.preventDefault() });
    const onDeclareBounds = props['onDeclareBounds'] || (() => {});
    const flippingElementBounds = props['flippingElementBounds'] || (() => null);

    const ref = useRef();
    const [backdropHover, setBackdropHover] = useState(false);

    const [isInClosingGesture, setIsInClosingGesture] = useState(false);
    const [closingGestureTranslatePx, setClosingGestureTranslatePx] = useState(0);
    const [closingGestureDragStart, setClosingGestureDragStart] = useState(0);
    const [closingGestureDragEnd, setClosingGestureDragEnd] = useState(0);

    const animateLastUpdateRef = useRef(0);

    useEffect(() => {
        if (!ref.current)
            return;
        if (open) {
            if (!ref.current.open) {
                ref.current.showModal();
                onDeclareBounds(ref.current.getBoundingClientRect());
            }
        } else if (flipFactor === 0) {
            if (ref.current.open) {
                ref.current.close();
            }
        }
    }, [open, flipFactor]);

    if (!props.children) {
        return null;
    }

    const style = {};

    if (ref.current && flipFactor !== 1 && flippingElementBounds) {
        const popupCenter = [
            ref.current.offsetLeft + ref.current.offsetWidth/2,
            ref.current.offsetTop + ref.current.offsetHeight/2
        ];
        const triggerCenter = [
            flippingElementBounds.left + flippingElementBounds.width/2,
            flippingElementBounds.top + flippingElementBounds.height/2
        ];
        const offset = [triggerCenter[0] - popupCenter[0], triggerCenter[1] - popupCenter[1]];
        const initialScale = flippingElementBounds.height/ref.current.offsetHeight;

        const tx = (1 - flipFactor) * offset[0];
        const ty = (1 - flipFactor) * offset[1] + closingGestureTranslatePx;
        const angle = - (1 - flipFactor) * Math.PI;
        const scale = lerp(initialScale, 1, flipFactor);
        if (flipFactor < 0.5) {
            style.transform = null;
            style.visibility = 'hidden';
        } else {
            style.transform = `translate3d(${tx}px, ${ty}px, 0px) scale(${scale}) perspective(1500px) rotateY(${angle}rad)`;
            style.visibility = null;
        }
    } else if (flipFactor === 1) {
        style.transform = `translate3d(0px, ${closingGestureTranslatePx}px, 0px)`;
    }

    function requestClose(e) {
        e.preventDefault();
        onClose(e);
    }

    function onTouchStart(e) {
        if (ref.current && ref.current.scrollTop == 0 && !isInClosingGesture && e.touches.length === 1) {
            setIsInClosingGesture(true);
            setClosingGestureDragStart(e.touches[0].clientY);
            setClosingGestureDragEnd(e.touches[0].clientY);
        }
    }

    function onTouchMove(e) {
        if (!isInClosingGesture || flipFactor !== 1)
            return;
        setClosingGestureDragEnd(e.touches[0].clientY);
        let translateY = closingGestureDistanceFunction(closingGestureDragEnd - closingGestureDragStart);
        if (translateY < 0)
            translateY = 0;
        setClosingGestureTranslatePx(translateY);
    }

    function onTouchEnd(e) {
        setIsInClosingGesture(false);
        animateLastUpdateRef.current = 0;
        if (Math.abs(closingGestureTranslatePx) > getClosingGestureDistanceThreshold()) {
            requestClose(e);
        }
    }

    function closingGestureDistanceFunction(x) {
        const asymptote = 75;
        return 2 * asymptote / (1 + Math.exp(-x / asymptote)) - asymptote;
    }

    function animate(time) {
        if (isInClosingGesture || !animateLastUpdateRef.current) {
            animateLastUpdateRef.current = time;
            return;
        }
        const delta = time - animateLastUpdateRef.current;
        const speed = 0.02;
        const diff = -closingGestureTranslatePx * delta * speed;
        setClosingGestureTranslatePx(v => Math.abs(v) > 1 ? v + diff : 0);
        animateLastUpdateRef.current = time;
    }

    function getClosingGestureDistanceThreshold() {
        return 40;
    }

    if (closingGestureTranslatePx !== 0) {
        requestAnimationFrame(animate);
    }
    
    return (
        <dialog
            autoFocus={true}
            className={`${styles.popupWindow} ${open ? styles.shadowBackdrop : ''}`}
            ref={ref}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onCancel={requestClose}>
            <div className={`${styles.desktopReturnHint} ${open ? styles.show : ''} ${backdropHover ? styles.backdropHover : ''}`}>
                <img className={styles.returnIcon} src={returnIcon} alt="Return icon"/>
                <div className={styles.returnHintText}>Return</div>
            </div>
            <div className={`${styles.touchReturnHint} ${open ? styles.show : ""}`}>
                <div className={styles.dragBar}></div>
            </div>
            <div className={styles.backdropHitBox}
                 onClick={requestClose}
                 onMouseEnter={() => setBackdropHover(true)}
                 onMouseLeave={() => setBackdropHover(false)}>
            </div>
            <div className="body" style={style}>
                {props.children}
            </div>
        </dialog>
    );
}
