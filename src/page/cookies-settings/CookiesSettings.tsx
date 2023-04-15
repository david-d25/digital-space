import React from "react";

import "./cookies-settings.scss";
import {useRecoilState} from "recoil";
import {DataStorageConsentState} from "../../service/ConfigService";
import {servicesState} from "../../state/servicesState";

export default function CookiesSettings() {
    const [services] = useRecoilState(servicesState);
    const [cookiesConsentState, setCookiesConsentState] = useRecoilState(services.configService.cookiesConsentState);
    document.title = "Cookies Settings";
    return (
        <div className="c-cookies-settings">
            <h1>Cookies Settings</h1>
            <div className="main-form">
                <input type="checkbox"
                       checked={cookiesConsentState == DataStorageConsentState.ACCEPTED}
                       onChange={e => setCookiesConsentState(
                           e.target.checked
                               ? DataStorageConsentState.ACCEPTED
                               : DataStorageConsentState.REJECTED
                       )}/>
                <label>I agree to the use of cookies on this website.</label>
            </div>
        </div>
    );
}