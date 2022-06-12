{
    let coolClickTargets = document.querySelectorAll(".cool_click_effect");

    for (let target of coolClickTargets) {
        target.addEventListener("mousedown", event => onCoolClickTargetMouseDown(target, event))
        target.addEventListener("mouseup", () => onCoolClickTargetMouseUp(target))
        target.addEventListener("mouseleave", () => onCoolClickTargetMouseUp(target))
    }

    function onCoolClickTargetMouseDown(target, event) {
        let rect = target.getBoundingClientRect();
        let rotationY = (2*(event.clientX - rect.x)/rect.width - 1)*10;
        let rotationX = (2*(event.clientY - rect.y)/rect.height - 1)*10;
        let scale = 1;
        target.coolEffects = {rotationX, rotationY, scale};
        target.style.transform = `perspective(800px) translateZ(${-scale*15}px) rotateY(${scale*rotationY}deg) rotateX(${-scale*rotationX}deg)`;
    }

    function onCoolClickTargetMouseUp(target) {
        if (target.coolEffects == null)
            return;
        let { rotationY, rotationX, scale } = target.coolEffects;
        target.coolEffects = null;
        animate();
        function animate() {
            target.style.transform = `perspective(800px) translateZ(${-scale*15}px) rotateY(${scale*rotationY}deg) rotateX(${-scale*rotationX}deg)`;
            scale = scale*0.95 - 0.04;
            if (scale > 0)
                window.requestAnimationFrame(animate);
            else
                target.style.transform = "";
        }
    }
}