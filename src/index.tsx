import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import Home from './page/home/Home';
import Books from './page/books/Books';
import NotFound from './page/not-found/NotFound';
import Header from "./component/header/Header";
import CookiesPolicy from "./page/cookies-policy/CookiesPolicy";
import Footer from "./component/footer/Footer";
import AutoScrollToTop from "./util/AutoScrollToTop";
import ConfigStorageService from "./service/ConfigStorageService";
import CookiesPopup from "./component/cookies-popup/CookiesPopup";
import {RecoilRoot} from "recoil";

import "@/style/theme-light.scss";
import "@/style/theme-dark.scss";

const configStorage = new ConfigStorageService();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <BrowserRouter>
                <AutoScrollToTop/>
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/books" element={<Books/>}/>
                    <Route path="/cookies-policy" element={<CookiesPolicy/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
                <Footer/>
                <CookiesPopup configStorage={configStorage}/>
            </BrowserRouter>
        </RecoilRoot>
    </React.StrictMode>
);
