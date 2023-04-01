export enum DataStorageConsentState {
    NULL = "NULL",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export default class ConfigStorageService {
    private static readonly DATA_STORAGE_CONSENT_KEY = "data_storage_consent";

    getItem(key: string): string {
        return localStorage.getItem(key);
    }

    setItem(key: string, value: string) {
        if (this.getCookiesConsentState() === DataStorageConsentState.ACCEPTED)
            localStorage.setItem(key, value);
    }

    getCookiesConsentState(): DataStorageConsentState {
        const value = localStorage.getItem(ConfigStorageService.DATA_STORAGE_CONSENT_KEY);
        if (value)
            return value === "ACCEPTED" ? DataStorageConsentState.ACCEPTED : DataStorageConsentState.REJECTED;
        return DataStorageConsentState.NULL;
    }

    setCookiesConsentState(state: DataStorageConsentState) {
        if (state !== DataStorageConsentState.ACCEPTED)
            localStorage.clear();
        localStorage.setItem(ConfigStorageService.DATA_STORAGE_CONSENT_KEY, state.toString());
    }
}