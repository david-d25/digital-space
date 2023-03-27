import "./cookies-popup.scss";
import {Link} from "react-router-dom";
import ConfigStorageService, {DataStorageConsentState} from "../../service/ConfigStorageService";
import React from "react";

export default class CookiesPopup extends React.Component<{ configStorage: ConfigStorageService }, { show: boolean }> {
    constructor(props) {
        super(props);
        this.state = {
            show: props.configStorage.getCookiesConsentState() == DataStorageConsentState.NULL
        }
    }

    render() {
        return (
             this.state.show && (
                <div className="c-cookies-popup">
                    <div className="message">
                        This website needs to use Cookies and LocalStorage.
                        Check out our <Link to="/cookies-policy">Cookies Policy</Link> for more info.
                    </div>
                    <div className="buttons">
                        <button className="button" onClick={() => this.onAcceptClick()}>Accept</button>
                        <button className="button" onClick={() => this.onRejectClick()}>Reject</button>
                    </div>
                </div>
            )
        );
    }

    onAcceptClick() {
        this.props.configStorage.setCookiesConsentState(DataStorageConsentState.ACCEPTED);
        this.setState({ show: false });
    }

    onRejectClick() {
        this.props.configStorage.setCookiesConsentState(DataStorageConsentState.REJECTED);
        this.setState({ show: false });
    }
}