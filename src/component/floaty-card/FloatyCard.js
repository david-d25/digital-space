import React, {useEffect, useRef, useState} from 'react';
import style from './FloatyCard.module.scss';

export default function FloatyCard(props) {
    const { frontSide, backSide, flipped } = props;

    const [active, setActive] = useState(false);
    const transformDelta = useRef({rotationX: 0, rotationY: 0, scale: 0});
    const transform = useRef({rotationX: 0, rotationY: 0, scale: 1});
    const lastUpdateTime = useRef(-1);
    const [a, b] = useState(false);
    useEffect(() => {
        if (!active) {
            setActive(true);
            update();
        }
    }, [flipped, a]);

    const [, forceUpdate] = useState(0);

    const targetTransform = a ? {rotationX: 0, rotationY: 180, scale: 1} : {rotationX: 0, rotationY: 0, scale: 1};

    function update() {
        if (lastUpdateTime.current === -1) {
            lastUpdateTime.current = Date.now()/1000 - 1/60;
        }
        const now = Date.now()/1000;
        let delta = now - lastUpdateTime.current;
        if (delta > 0.1) {
            delta = 0.1;
        }
        const clamp = (x, min, max) => { return Math.min(Math.max(x, min), max) }
        const rotationAccelerationX = Math.tanh(targetTransform.rotationX - transform.current.rotationX)*10000;
        const rotationAccelerationY = Math.tanh(targetTransform.rotationY - transform.current.rotationY)*10000;
        const scaleAcceleration = Math.tanh(targetTransform.scale - transform.current.scale)*10000;
        transformDelta.current = {
            rotationX: transformDelta.current.rotationX*0.8 + rotationAccelerationX * delta,
            rotationY: transformDelta.current.rotationY*0.8 + rotationAccelerationY * delta,
            scale: transformDelta.current.scale*0.8 + scaleAcceleration * delta
        };
        transform.current = {
            rotationX: transform.current.rotationX + transformDelta.current.rotationX*delta,
            rotationY: transform.current.rotationY + transformDelta.current.rotationY*delta,
            scale: transform.current.scale + transformDelta.current.scale*delta
        };
        lastUpdateTime.current = now;
        const epsilon = 0.1;
        if (
            Math.abs(transform.current.rotationX - targetTransform.rotationX) < epsilon &&
            Math.abs(transform.current.rotationX - targetTransform.rotationY) < epsilon &&
            Math.abs(transform.current.scale - targetTransform.scale) < epsilon
        ) {
            transform.current = targetTransform;
            lastUpdateTime.current = -1;
            setActive(false);
        } else {
            window.requestAnimationFrame(update);
        }
        forceUpdate(now);
    }

    const transformStyle = {
        transform: `
            perspective(800px)
            translate3d(0, 0, 0)
            rotateX(${transform.current.rotationX}deg)
            rotateY(${transform.current.rotationY}deg)
            scale(${transform.current.scale})
        `
    };

    const normalizedRotationX = ((transform.current.rotationX % 360) + 360) % 360;
    const normalizedRotationY = ((transform.current.rotationY % 360) + 360) % 360;
    const onlyXFlip = normalizedRotationX < 90 || normalizedRotationX > 270;
    const onlyYFlip = normalizedRotationY < 90 || normalizedRotationY > 270;

    const showFrontSide = !(onlyXFlip ^ onlyYFlip);

    return (
        <div className={style.floatyCard} style={transformStyle} onClick={() => b(it => !it)}>
            { showFrontSide ? frontSide : backSide }
        </div>
    )
}