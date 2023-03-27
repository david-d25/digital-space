import React from "react";

import "./header.scss"
import {Link, useMatch} from "react-router-dom";
import ThemeSwitch from "../theme-switch/ThemeSwitch";

export default function() {
    return (
        <header className="c-header">
            <div className="container">
                <div className="header-body">
                    <div className="logo">
                        David's Digital<br/>Space
                    </div>
                    <div className="links">
                        <Link className={"link" + (useMatch('/') ? ' active' : '')} to="/">Home</Link>
                        <Link className={"link" + (useMatch('/books') ? ' active' : '')} to="/books">Books</Link>
                    </div>
                    <div className="theme-switch">
                        <ThemeSwitch/>
                    </div>
                </div>
            </div>
        </header>
    )
}