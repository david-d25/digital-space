import "./cookies-popup.scss";
import {Link} from "react-router-dom";
import {DataStorageConsentState} from "../../service/ConfigService";
import React from "react";
import {useRecoilState} from "recoil";
import {servicesState} from "../../state/servicesState";

export default function CookiesPopup() {
    const [services] = useRecoilState(servicesState);
    const [cookiesConsentState, setCookiesConsentState] = useRecoilState(services.configService.cookiesConsentState);

    return (
        cookiesConsentState == DataStorageConsentState.NULL && (
            <div className="c-cookies-popup">
                <div className="message">
                    This website needs to use Cookies and LocalStorage.
                    Check out our <Link to="/cookies-policy">Cookies Policy</Link> for more info.
                </div>
                <div className="buttons">
                    <button className="button" onClick={() => setCookiesConsentState(DataStorageConsentState.ACCEPTED)}>
                        Accept
                    </button>
                    <button className="button" onClick={() => setCookiesConsentState(DataStorageConsentState.REJECTED)}>
                        Reject
                    </button>
                </div>
            </div>
        )
    );
}