export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function cubicBezier(t, p1x, p1y, p2x, p2y) {
    function bezier(t, p0, p1, p2, p3) {
        const c = 3 * (p1 - p0);
        const b = 3 * (p2 - p1) - c;
        const a = p3 - p0 - c - b;
        return ((a * t + b) * t + c) * t + p0;
    }

    function bezierDerivative(t, p0, p1, p2, p3) {
        const c = 3 * (p1 - p0);
        const b = 3 * (p2 - p1) - c;
        const a = p3 - p0 - c - b;
        return (3 * a * t + 2 * b) * t + c;
    }

    let x = t, prev, i = 0;
    do {
        prev = x;
        x -= (bezier(x, 0, p1x, p2x, 1) - t) / bezierDerivative(x, 0, p1x, p2x, 1);
        i++;
    } while (Math.abs(x - prev) > 1e-6 && i < 10);

    return bezier(x, 0, p1y, p2y, 1);
}
