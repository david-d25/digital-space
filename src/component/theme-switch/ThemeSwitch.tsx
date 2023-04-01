import React from "react";

import "./theme-switch.scss";
import {useRecoilState} from "recoil";
import {themeState} from "../../state/themeState";
import {servicesState} from "../../state/servicesState";

class ThemeSwitch extends React.Component<any, any> {
    componentDidMount() {
        let defaultTheme = 'light';

        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches)
                defaultTheme = 'dark';
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                this.setTheme(event.matches ? "dark" : "light")
            });
        }

        const savedTheme = this.props.configService.getItem("theme");
        if (savedTheme)
            defaultTheme = savedTheme;

        this.props.setTheme(defaultTheme);
    }

    render() {
        return (
            <div className="c-theme-switch">
                <div className={"body " + this.props.theme}
                     role="button"
                     onClick={() => this.switchTheme()}>
                    <div className="icon dark">🌙</div>
                    <div className="icon light">☀️</div>
                    <div className="handle"></div>
                </div>
            </div>
        );
    }

    private switchTheme() {
        const newTheme = this.props.theme === "light" ? "dark" : "light";
        this.setTheme(newTheme)
    }

    private setTheme(theme) {
        this.props.setTheme(theme);
        this.props.configService.setItem("theme", theme);
    }
}

export default function (props) {
    const [theme, setTheme] = useRecoilState(themeState);
    const [services] = useRecoilState(servicesState);
    return <ThemeSwitch theme={theme} setTheme={setTheme} configService={services.configService} {...props}/>
}