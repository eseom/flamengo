const Path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const AssetPlugin = require('assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const utils = require('./utils')

const assetsPath = Path.resolve(__dirname, '../static/dist')
const projectRootPath = Path.resolve(__dirname, '../')
const assetPlugin = new AssetPlugin()

// babel
let babelrcObject = {}
try {
  babelrcObject = require('../package.json').babel
} catch (err) {
  console.error('==>     ERROR: Error parsing your babel.json.')
  console.error(err)
}

let babelConfig = {}
if (babelrcObject.env) {
  babelConfig = babelrcObject.env.development
}

const extractText = new ExtractTextPlugin({
  filename: 'style-[chunkhash].css',
  disable: false,
  allChunks: true,
})

const cssLoaders = utils.cssLoaders({
  sourceMap: true,
  extract: true,
})

const styleLoaders = utils.styleLoaders({
  sourceMap: true,
  extract: true,
})

module.exports = {
  devtool: 'inline-source-map',
  context: Path.resolve(__dirname, '..'),
  entry: {
    main: [
      './src/client.js',
    ],
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/static/dist/',
  },
  module: {
    rules: [
      ...styleLoaders,
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelConfig,
          },
          // 'eslint-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: cssLoaders,
        },
      },
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.(png|jpg|jpeg)?$/, use: 'file-loader' },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [
      Path.resolve(`${__dirname}/../src`),
      Path.resolve(`${__dirname}/../node_modules`),
    ],
    alias: {
      vue$: 'vue/dist/vue.common.js',
    },
  },
  plugins: [
    assetPlugin,
    new CleanPlugin([assetsPath], { root: projectRootPath }),
    extractText,
    new UglifyJSPlugin({
      mangle: {
        // except: ['$'],
      },
      extractComments: true,
    }),
    new webpack.DefinePlugin({
      CLIENT: true,
      SERVER: false,
      DEVELOPMENT: false,
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ],
}
