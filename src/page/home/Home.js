import React from "react";
import { Link } from "react-router-dom";

import "./home.scss";
import Popup from "../../component/popup/Popup";
import avatar from "#/img/avatar.jpg";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popupImageSrc: null
        };
    }

    render() {
        return (
            <div className="c-home main_wr">
                <div className="container">
                    <div className="main">
                        <div className="left">
                            <CoolClickEffect className="ava_wr">
                                <img className="ava" src={avatar} alt="My avatar"/>
                            </CoolClickEffect>
                        </div>

                        <div className="right">
                            <Card title="Info" className="main_info">
                                <div className="bio">I'm David, a Java & Web developer.</div>
                                <div className="bio">I like&nbsp;
                                    <span className="clickable"
                                          onClick={() => this.showImageInPopup("img/eagle_owl.jpg")}>
                                        owls
                                    </span>
                                    ,&nbsp;
                                    <span className="clickable"
                                          onClick={() => this.showImageInPopup("img/cat.jpg")}>
                                        cats
                                    </span>
                                    ,&nbsp;
                                    <span className="clickable"
                                          onClick={() => this.showImageInPopup("img/parrot.jpg")}>
                                        parrots
                                    </span>
                                    , and&nbsp;
                                    <span className="clickable"
                                          onClick={() => this.showImageInPopup("img/raccoon.jpg")}>
                                        raccoons
                                    </span>
                                    .
                                </div>
                            </Card>

                            <Card title="Contact Me" className="contacts">
                                <div className="contact">
                                    <a href="mailto:david-d25@protonmail.com" target="_blank" rel="noopener noreferrer">david-d25@protonmail.com</a>
                                </div>
                                <div className="contact">
                                    <a href="https://t.me/david_d25" target="_blank" rel="noopener noreferrer">Telegram</a>
                                </div>
                                <div className="contact">
                                    <a href="https://github.com/david-d25" target="_blank" rel="noopener noreferrer">GitHub</a>
                                </div>
                            </Card>

                            <Card title="Interested In" className="interests">
                                <div className="interest">Java</div>
                                <div className="interest">Web</div>
                                <div className="interest">Memes</div>
                                <div className="interest">OpenGL</div>
                                <div className="interest">
                                    <Link to="/books">Books</Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <Popup active={this.state.popupImageSrc} onCloseClick={() => this.closePopup()}>
                    <img className="popup-image" src={this.state.popupImageSrc} alt="popup image"/>
                </Popup>
            </div>
        )
    }

    showImageInPopup(src) {
        this.setState({
            popupImageSrc: src
        });
    }

    closePopup() {
        this.setState({
            popupImageSrc: null
        });
    }
}

function Card(props) {
    return (
        <CoolClickEffect className="card">
            {props.title && <div className="card_title">{props.title}</div>}
            {props.children}
        </CoolClickEffect>
    )
}

class CoolClickEffect extends React.Component {
    el = null;
    coolEffects = null;
    previousAnimationTimestamp = null;

    render() {
        return (
            <div className={this.props.className + " cool_click_effect"}
                 onMouseDown={e => this.effectPress(e)}
                 onMouseUp={e => this.effectLeave(e)}
                 onMouseLeave={e => this.effectLeave(e)}
                 ref={ref => this.el = ref}
            >
                {this.props.children}
            </div>
        )
    }
    
    effectPress(event) {
        if (event.target.tagName === "A")
            return;
        const rect = this.el.getBoundingClientRect();
        const rotationY = (2*(event.clientX - rect.x)/rect.width - 1)*10;
        const rotationX = (2*(event.clientY - rect.y)/rect.height - 1)*10;
        const scale = 1;
        this.coolEffects = {rotationX, rotationY, scale};
        this.previousAnimationTimestamp = null;
        this.applyTransform();
    }

    effectLeave() {
        if (this.coolEffects === null)
            return;
        window.requestAnimationFrame(timestamp => this.animate(timestamp));
    }

    animate(timestamp) {
        if (this.previousAnimationTimestamp === null)
            this.previousAnimationTimestamp = timestamp;
        let delta = timestamp - this.previousAnimationTimestamp;
        this.applyTransform();
        this.coolEffects.scale -= (this.coolEffects.scale*0.001 + 0.002)*delta;
        if (this.coolEffects.scale > 0)
            window.requestAnimationFrame(timestamp => this.animate(timestamp));
        else
            this.el.style.transform = "";
        this.previousAnimationTimestamp = timestamp;
    }

    applyTransform() {
        let rect = this.el.getBoundingClientRect();
        let { rotationY, rotationX, scale } = this.coolEffects;
        this.el.style.transform = ` perspective(800px)
                                    translate3d(${-rect.width/2*Math.sign(rotationY)}px, ${-rect.height/2*Math.sign(rotationX)}px, ${-scale*20}px)
                                    rotateY(${scale*rotationY}deg)
                                    rotateX(${-scale*rotationX}deg)
                                    translate3d(${rect.width/2*Math.sign(rotationY)}px, ${rect.height/2*Math.sign(rotationX)}px, ${scale*20}px)`;
    }
}