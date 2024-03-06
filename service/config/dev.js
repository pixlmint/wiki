'use strict'

const {merge} = require('webpack-merge')

const baseWebpackConfig = require('./base')
const cssWebpackConfig = require('./css')
const config = require('../project.config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(baseWebpackConfig, cssWebpackConfig, {
    mode: 'development',

    devtool: 'eval-cheap-module-source-map',

    devServer: {
        historyApiFallback: {
            rewrites: [{from: /./, to: '/index.html'}],
        },
        devMiddleware: {
            publicPath: config.dev.publicPath,
        },
        open: false,
        host: '0.0.0.0',
        port: config.dev.port,
        liveReload: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:94',
                pathRewrite: {'^/api': '/api'}
            },
            '/backup': {
                target: 'http://127.0.0.1:94',
                pathRewrite: {'^/backup': '/backup'}
            },
            '/media': {
                target: 'http://127.0.0.1:94',
                pathRewrite: {'^/media': '/media'}
            }
        },
    },

    plugins: [
        new BundleAnalyzerPlugin(),
    ],

    infrastructureLogging: {
        level: 'warn',
    },

    stats: {
        assets: false,
        modules: false,
    },
})
