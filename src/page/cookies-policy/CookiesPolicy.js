import "@/page/cookies-policy/cookies-policy.scss";
import React from "react";

export default class CookiesPolicy extends React.Component {
    render() {
        return (
            <div className="c-cookies-policy container">
                <h1>Cookies Policy</h1>
                <p>Last updated: [Insert date]</p>
                <p>
                    This Cookies Policy explains how this website ("we", "us", "out", or "the Site") uses cookies
                    and similar technologies to improve your experience on this website.
                    By continuing to use the Site, you agree to our use of cookies in accordance with this policy.
                </p>
                <h2>What are cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile phone)
                    when you visit a website. Cookies are used to remember your preferences, personalize your
                    experience, and analyze website usage.
                </p>
                <h2>What cookies does this website use?</h2>
                <p>The Site uses the following types of cookies:</p>
                <ul>
                    <li>
                        Necessary cookies: These cookies are essential for the operation of the
                        Site and enable us to provide you with a secure and efficient browsing experience.
                        For example, we use cookies to remember your preferences, such as your preferred website theme.
                    </li>
                    <li>
                        Analytics cookies: These cookies are used to collect information about how visitors use the
                        Site, such as which pages they visit most often and if they receive error messages.
                        We use this information to improve the Site and provide a better user experience.
                        Our analytics cookies are provided by Google Analytics.
                    </li>
                    <li>
                        reCAPTCHA cookies: We use reCAPTCHA to prevent spam and protect the Site from abuse.
                        reCAPTCHA is provided by Google, and may collect data about users who interact with the reCAPTCHA widget.
                        reCAPTCHA v3 is subject to the Google&nbsp;
                        <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
                        <a href="https://policies.google.com/terms">Terms of Use</a>.
                    </li>
                </ul>
                <h2>How to manage cookies</h2>
                <p>
                    You can manage your cookie preferences at any time by clicking on the "Cookie Settings" link in
                    the footer of the Site. Please note that disabling cookies may limit your ability to use
                    certain features of the Site.
                </p>
                <p>
                    If you are unsure how to manage your cookie preferences, you can use the "Help" function in your
                    browser or visit the following websites for more information:
                </p>
                <ol>
                    <li>
                        <span>Chrome: </span>
                        <a href="https://support.google.com/chrome/answer/95647"
                           className="break-word">
                            https://support.google.com/chrome/answer/95647
                        </a>
                    </li>
                    <li>
                        <span>Firefox: </span>
                        <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                           className="break-word">
                            https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences
                        </a>
                    </li>
                    <li>
                        <span>Safari: </span>
                        <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
                           className="break-word">
                            https://support.apple.com/guide/safari/manage-cookies-sfri11471
                        </a>
                    </li>
                    <li>
                        <span>Internet Explorer: </span>
                        <a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies"
                           className="break-word">
                            https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies
                        </a>
                    </li>
                </ol>
                <h2>Changes to this policy</h2>
                <p>
                    We may update this Cookies Policy from time to time.
                    We encourage you to review this policy periodically for any updates or changes.
                </p>
                <h2>Contact us</h2>
                <p>
                    If you have any questions about this Cookies Policy, please contact us at [Insert contact email].
                </p>
            </div>
        );
    }
}