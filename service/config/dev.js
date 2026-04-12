'use strict'

const { merge } = require('webpack-merge')
const path = require('path')

const baseWebpackConfig = require('./base')
const cssWebpackConfig = require('./css')
const config = require('../project.config')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const finalConfig = merge(baseWebpackConfig, cssWebpackConfig, {
    mode: 'development',

    devtool: 'eval-cheap-module-source-map',

    resolve: {
        symlinks: false,
    },

    watchOptions: {
        followSymlinks: true,
        // ignored: /node_modules\/(?!pixlcms-wrapper)/
    },

    devServer: {
        historyApiFallback: {
            rewrites: [{ from: /./, to: '/index.html' }],
        },
        devMiddleware: {
            publicPath: config.dev.publicPath,
        },
        open: false,
        host: '0.0.0.0',
        port: config.dev.port,
        liveReload: true,
        proxy: [
            {
                context: '/api',
                target: 'http://127.0.0.1:94',
                pathRewrite: { '^/api': '/api' }
            },
            {
                context: '/backup',
                target: 'http://127.0.0.1:94',
                pathRewrite: { '^/backup': '/backup' }
            },
            {
                context: '/media',
                target: 'http://127.0.0.1:94',
                pathRewrite: { '^/media': '/media' }
            }
        ],
    },

    //plugins: [
    //    new BundleAnalyzerPlugin(),
    //],

    infrastructureLogging: {
        level: 'warn',
    },

    stats: {
        assets: false,
        modules: false,
    },
})

//const fs = require('fs')
//const util = require('util')
//
//fs.writeFileSync(
//    'webpack-config-dump.json', 
//    JSON.stringify(finalConfig, (key, value) => {
//        // Handle circular references and functions
//        if (typeof value === 'function') {
//            return value.toString()
//        }
//        return value
//    }, 2)
//)

module.exports = finalConfig;
