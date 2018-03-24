
const compressionPlugin = require('compression-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const htmlPlugin = new htmlWebpackPlugin({
  filename: 'index.html',
  hash: true,
  inject: 'body',
  template: './client/template.html'
});

module.exports = {
  devServer: {
    compress: true,
    contentBase: path.resolve('public'),
    hot: true,
    port: 8081,
    publicPath: '/'
  },
  entry: ['babel-polyfill', './client/index.js'],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            inline: true,
            name: 'fetch.worker.js'
          }
        }
      },
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
    path: path.resolve('public'),
    publicPath: '/'
  },
  plugins: [
    htmlPlugin,
		new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.ProvidePlugin({
      Promise: 'bluebird'
    }),
    new uglifyJsPlugin(),
    new compressionPlugin({
      algorithm: 'gzip',
      asset: '[path].gz[query]'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve(__dirname, "client"),
      "node_modules"
    ]
  }
};
