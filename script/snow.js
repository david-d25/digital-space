{
    const SNOWFLAKES_PER_PIXEL = 1/10000;
    const WIND = {
        X: {
            MIN: -10,
            MAX: 10
        },
        Y: {
            MIN: 0,
            MAX: 0
        }
    };
    const DELTA_RATIO = 0.01;

    window.Snow = function(el) {
        let newEl = document.createElement('div');
        el.appendChild(newEl);
        el = newEl;

        let width = el.clientWidth;
        let height = el.clientHeight;
        let area = width*height;
        let gravity = 10;
        let lastUpdate = Date.now();

        el.parentElement.style.position = 'relative';

        el.style.position = 'absolute';
        el.style.minWidth = '100%';
        el.style.minHeight = '100%';
        el.style.top = '0';
        el.style.left = '0';
        el.style.bottom = '0';
        el.style.right = '0';
        el.style.filter = 'blur(2px)';
        el.style.overflow = 'hidden';

        createBottomSnow();

        let wind = {
            x: 0,
            y: 0
        };

        let snowflakes = [];

        setInterval(step, 16);

        function createSnowflake() {
            let snowflakeEl = document.createElement('div');
            snowflakeEl.style.backgroundColor = 'white';
            let size = 3 + Math.random()*6;
            snowflakeEl.style.width = size + 'px';
            snowflakeEl.style.height = size + 'px';
            snowflakeEl.style.position = 'absolute';
            snowflakeEl.style.borderRadius = '100%';
            let opacity = Math.random();
            snowflakeEl.style.opacity = `${opacity}`;
            el.appendChild(snowflakeEl);

            let snowflake = {
                x: Math.random()*width*1.5 - width/4,
                y: -10,
                size: size,
                el: snowflakeEl
            };

            snowflakes.push(snowflake);
        }

        function saturation(val, min, max) {
            return val < min ? min : val > max ? max : val;
        }

        function updateWind() {
            wind.x = saturation(wind.x + Math.random() - 0.5, WIND.X.MIN, WIND.X.MAX);
            wind.y = saturation(wind.y + Math.random() - 0.5, WIND.Y.MIN, WIND.Y.MAX);
        }

        function step() {
            if (Date.now() - lastUpdate > 500) {
                lastUpdate = Date.now();
                return;
            }

            let delta = (Date.now() - lastUpdate)*DELTA_RATIO;

            width = el.clientWidth;
            height = el.clientHeight;
            area = width*height;

            let probability = snowflakes.length < SNOWFLAKES_PER_PIXEL*area ? 0.75 : 0.25;
            if (Math.random() < probability)
                createSnowflake();

            for (let i = 0; i < snowflakes.length; i++) {
                let item = snowflakes[i];

                item.x += wind.x / item.size * delta;
                item.y += (gravity + wind.y)*delta;

                item.el.style.top = item.y + 'px';
                item.el.style.left = item.x + 'px';

                if (item.y > height*1.5) {
                    item.el.remove();
                    snowflakes.splice(i, 1);
                }
            }

            updateWind();
            lastUpdate = Date.now();
        }

        function createBottomSnow() {
            el.parentElement.style.paddingBottom = '10vh';
            let x = -50;

            while (x < 150) {
                let div = document.createElement('div');

                let divHeight = 2 + Math.random()*10;
                div.style.position = 'absolute';
                div.style.left = x + 'vw';
                div.style.bottom = -divHeight/2 + 'vh';
                div.style.background = 'white';
                div.style.borderRadius = '100%';
                div.style.height = divHeight + 'vh';
                div.style.width = divHeight + Math.random()*30 + 'vw';

                el.append(div);
                x += Math.random()*3;
            }
        }
    }
}