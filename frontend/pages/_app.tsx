import NextApp, { type AppContext, type AppProps } from 'next/app'

import '@/styles/globals.scss'
import Head from "next/head";
import {HydrationBoundary, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";
import {ModalProvider} from "@/components/Modal/ModalProvider";
import {ModalServiceInitializer} from "@/components/Modal/ModalServiceInitializer";
import GlobalLoadingIndicator from "@/components/GlobalLoadingIndicator/GlobalLoadingIndicator";
import {fontVariables} from "@/lib/fonts";
import {ToastProvider} from "@/components/Toast/ToastProvider";
import {ToastServiceInitializer} from "@/components/Toast/ToastServiceInitializer";
import {UrlParamsProvider} from "@/components/UrlParamsProvider/UrlParamsProvider";
import {ThemeProvider} from "@/components/ThemeProvider/ThemeProvider";

function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient())
    const initialSearch: string =
        typeof window === "undefined"
            ? pageProps.__initialSearch ?? ""
            : window.location.search.replace(/^\?/, "");

    return (
        // Duplicates <body> classname because otherwise doesn't work, I don't know why
        <div className={fontVariables}>
            <Head>
                <link rel="icon" sizes="any" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`} />
            </Head>
            <ThemeProvider>
                <QueryClientProvider client={queryClient}>
                    <HydrationBoundary state={pageProps.dehydratedState}>
                        <UrlParamsProvider initialSearch={initialSearch}>
                            <ToastProvider>
                                <ModalProvider>
                                    <ToastServiceInitializer/>
                                    <ModalServiceInitializer/>
                                    <GlobalLoadingIndicator/>
                                    <Component {...pageProps}/>
                                </ModalProvider>
                            </ToastProvider>
                        </UrlParamsProvider>
                    </HydrationBoundary>
                </QueryClientProvider>
            </ThemeProvider>
        </div>
    );
}

App.getInitialProps = async (appCtx: AppContext) => {
    const appProps = await NextApp.getInitialProps(appCtx);
    const q = appCtx.ctx.query;

    const initialSearch = new URLSearchParams(
        Object.entries(q).flatMap(([k, v]) =>
            v == null ? [] : Array.isArray(v) ? v.map(x => [k, String(x)]) : [[k, String(v)]]
        ) as [string, string][]
    ).toString();

    return {
        ...appProps,
        pageProps: {
            ...appProps.pageProps,
            __initialSearch: initialSearch,
        },
    };
};

export default App;