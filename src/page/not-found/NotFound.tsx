import { Link } from "react-router-dom"

import "@/page/not-found/not-found.scss"
import React from "react";

export default function NotFound() {
    return (
        <div className="not-found-wr">
            <div className="not-found">
                <h1 className="not-found__title">Not found!</h1>
                <div className="not-found__description">
                    This website has no idea what your URL should lead to.
                    <br/>
                    But you can always go to the <Link to="/">main page</Link>!
                </div>
            </div>
        </div>
    )
}