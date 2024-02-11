const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                },
            }, {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            // modules: true, // todo enable after all css is turned into modules
                            // localIdentName: '[name]__[local]' // todo add this to 'modules'
                        }
                    },
                    "sass-loader"
                ]
            }, {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }, {
                test: /\.(png|jpe?g|gif|ttf|svg)$/i,
                type: "asset/resource"
            }, {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource"
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public' }
            ]
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@public': path.resolve(__dirname, 'public'),
        },
    },
    devServer: {
        historyApiFallback: true,
        port: 3000,
    },
};