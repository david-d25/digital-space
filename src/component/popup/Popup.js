import React from "react";
import "./popup.scss";

export default class Popup extends React.Component {
    render() {
        const { active, onCloseClick } = this.props
        return (
            <div className={`c-popup ${active ? 'active requires-no-scroll' : ''}`}>
                <div className="backstage" onClick={onCloseClick}></div>
                <div className="body">
                    <div className="close-button" onClick={onCloseClick}></div>
                    {this.props.children}
                </div>
            </div>
        )
    }
}