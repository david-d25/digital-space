import Document, { Html, Head, Main, NextScript } from 'next/document';
import {fontVariables} from "@/lib/fonts";
import {THEME_INIT_SCRIPT} from "@/lib/theme";

export default class AppDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}}/>
                </Head>
                <body className={fontVariables}>
                    <Main/>
                    <NextScript/>
                </body>
            </Html>
        );
    }
}
