import {atom} from "recoil";

export const themeState = atom({
    key: 'themeState',
    default: 'light',
    effects: [
        ({onSet}) => {
            onSet(theme => document.body.setAttribute("data-theme", theme));
        }
    ]
})