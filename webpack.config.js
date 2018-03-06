const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
//const AgoraCustomPlugin = require('./agora-custom-plugin');

const port = 8080;
const lang = fs.readFileSync('../doc_source/LANG.txt', 'utf8').trim();
const version = fs.readFileSync('../doc_source/VERSION.txt', 'utf8').trim();

module.exports = {
    devServer: {
        hot: true,
        inline: true,
        contentBase: '../build/html/',
        port: port,
        historyApiFallback: true,
        proxy: [{
            path: `/${lang}/*(1.12|1.13|faq|${version})/*(instruction|quickstart|guides|tutorial|api|sdk|demo)/`,
            target: `http://localhost:${port}/${lang}/`,
            secure: false,
            ignorePath: true
        }, {
            path: `/${lang}/*(1.12|1.13|faq|${version})/*(instruction|quickstart|guides|tutorial|api)/*(detailPage)/*(quickstart_android.html|guide_android.html|communication_audio_android.html)`,
            target: `http://localhost:${port}/${lang}/`,
            secure: false,
            ignorePath: true
        }]
    },
    entry: ['babel-polyfill', path.resolve(__dirname, './main.js')],
    output: {
        path: path.resolve(__dirname, './assets'),
        publicPath: '/',
        filename: './bundle.js'
    },
    devtool: "source-map",
    module: {
        loaders: [
            {
                test: /\.js[x]?$/,
                include: path.resolve(__dirname),
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                include: path.resolve(__dirname, './style/'),
                loader: 'style-loader!css-loader?modules&localIdentName=[path][name]---[local]---[hash:base64:5]!sass-loader?sourceMap=true'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.svg$/,
                include: path.resolve(__dirname, './img/'),
                loader: 'svg-url-loader'
            },
            {
                test: /\.png/,
                include: path.resolve(__dirname, './img/'),
                loader: 'url-loader?mimetype=image/png'
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                exclude: path.resolve(__dirname, './img'),
                include: path.resolve(__dirname, './fonts'),
                loader: 'base64-font-loader'
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            }
        ]
    },
    plugins: [
        //new AgoraCustomPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({ url: 'http://localhost:' + port + '/' + lang })
    ]
}