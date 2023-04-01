import {atom} from "recoil";

export enum DataStorageConsentState {
    NULL = "NULL",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export default class ConfigService {
    private static readonly DATA_STORAGE_CONSENT_KEY = "data_storage_consent";

    public cookiesConsentState = atom({
        key: 'cookiesConsentState',
        default: this.getCookiesConsentState(),
        effects: [
            ({onSet}) => {
                onSet(v => this.setCookiesConsentState(v));
            }
        ]
    });

    getItem(key: string): string {
        return localStorage.getItem(key);
    }

    setItem(key: string, value: string) {
        if (this.getCookiesConsentState() === DataStorageConsentState.ACCEPTED)
            localStorage.setItem(key, value);
    }

    private getCookiesConsentState(): DataStorageConsentState {
        const value = localStorage.getItem(ConfigService.DATA_STORAGE_CONSENT_KEY);
        if (value)
            return value === "ACCEPTED" ? DataStorageConsentState.ACCEPTED : DataStorageConsentState.REJECTED;
        return DataStorageConsentState.NULL;
    }

    private setCookiesConsentState(state: DataStorageConsentState) {
        if (state !== DataStorageConsentState.ACCEPTED)
            localStorage.clear();
        localStorage.setItem(ConfigService.DATA_STORAGE_CONSENT_KEY, state.toString());
    }
}