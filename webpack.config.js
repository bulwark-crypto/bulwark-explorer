
const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const htmlPlugin = new htmlWebpackPlugin({
    filename: 'index.html',
    inject: 'body',
    template: './client/template.html'
});

module.exports = {
    devServer: {
        contentBase: path.resolve('public'),
        publicPath: '/'
    },
    entry: ['babel-polyfill', './client/index.js'],
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            'transform-class-properties',
                            'transform-object-rest-spread'
                        ],
                        presets: ['env', 'react']
                    }
                }
            },
            {
                test: /\.s?css/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve('public')
    },
    plugins: [
        htmlPlugin
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    }
};