import React from "react";

import "./footer.scss"
import {Link} from "react-router-dom";

export default class Footer extends React.Component {
    render() {
        return (
            <footer className="c-footer">
                <div className="container">
                    <div className="footer-body">
                        <div className="links">
                            <Link className="link" to="/cookies-policy">Cookies Policy</Link>
                            {/*<Link className="link" to="/cookies-settings">Cookies Settings</Link>*/}
                        </div>
                        {/*<div className="recaptcha-reference">*/}
                        {/*    This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.*/}
                        {/*</div>*/}
                    </div>
                </div>
            </footer>
        )
    }
}