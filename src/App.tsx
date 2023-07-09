import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import Home from './page/home/Home';
import Books from './page/books/Books';
import NotFound from './page/not-found/NotFound';
import Header from "./component/header/Header";
import CookiesPolicy from "./page/cookies-policy/CookiesPolicy";
import Footer from "./component/footer/Footer";
import AutoScrollToTop from "./util/AutoScrollToTop";
import CookiesPopup from "./component/cookies-popup/CookiesPopup";
import CookiesSettings from "./page/cookies-settings/CookiesSettings";
import {RecoilRoot} from "recoil";

import "@/style/theme-light.scss";
import "@/style/theme-dark.scss";

import './App.scss';

export default function() {
    return (
        <React.StrictMode>
            <RecoilRoot>
                <BrowserRouter>
                    <AutoScrollToTop/>
                    <div className="main-viewport">
                        <Header/>
                        <div className='page-contents'>
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/books" element={<Books/>}/>
                                <Route path="/cookies-policy" element={<CookiesPolicy/>}/>
                                <Route path="/cookies-settings" element={<CookiesSettings/>}/>
                                <Route path="*" element={<NotFound/>}/>
                            </Routes>
                            <Footer/>
                        </div>
                    </div>
                    <CookiesPopup/>
                </BrowserRouter>
            </RecoilRoot>
        </React.StrictMode>
    )
}