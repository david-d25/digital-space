import React from "react";

import "./theme-switch.scss";
import {useRecoilState} from "recoil";
import {themeState} from "../../state/themeState";

export default function ThemeSwitch() {
    const [theme, setTheme] = useRecoilState(themeState);

    return (
        <div className="c-theme-switch">
            <div className={"body " + theme} role="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <div className="icon dark">🌙</div>
                <div className="icon light">☀️</div>
                <div className="handle"></div>
            </div>
        </div>
    );
}