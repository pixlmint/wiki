'use strict'

const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')

const baseWebpackConfig = require('./base')
const cssWebpackConfig = require('./css')
const config = require('../project.config')
const terserOptions = require('./terserOptions')

const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = merge(baseWebpackConfig, cssWebpackConfig, {
  mode: 'production',

  output: {
    publicPath: config.build.publicPath,
  },

  plugins: [
      require('unplugin-auto-import/webpack').default({resolvers: [ElementPlusResolver()]}),
      require('unplugin-vue-components/webpack').default({resolvers: [ElementPlusResolver()]}),
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(terserOptions())],
    moduleIds: 'deterministic',
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          name: `chunk-vendors`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: `chunk-common`,
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    },
  },
})
