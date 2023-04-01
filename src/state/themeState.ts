import {atom} from "recoil";

function updateBodyAttribute(theme) {
    document.body.setAttribute("data-theme", theme)
}

export const themeState = atom({
    key: 'themeState',
    default: 'light',
    effects: [
        ({onSet}) => onSet(updateBodyAttribute)
    ]
})