const Path = require('path')
const webpack = require('webpack')
const utils = require('./utils')

const host = 'localhost'
const port = 3001 // packager port

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

const cssLoaders = utils.cssLoaders({
  sourceMap: true,
  extract: false,
})


module.exports = {
  devtool: 'inline-source-map',
  context: `${__dirname}/..`,
  output: {
    filename: 'bundle.js',
    publicPath: `http://${host}:${port}/`,
  },
  entry: [
    `webpack-hot-middleware/client?path=http://${host}:${port}/__webpack_hmr`,
    './src/client.js',
  ],
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
  module: {
    rules: [
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
          sourceMap: true,
          loaders: cssLoaders,
        },
      }, {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: false,
            },
          },
        ],
        include: [
          Path.resolve(__dirname, '..', 'node_modules'),
          Path.resolve(__dirname, '..', 'src'),
        ],
      },
      {
        test: /assets\/css\/.*scss/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
        include: [
          Path.resolve(__dirname, '..', 'node_modules'),
          Path.resolve(__dirname, '..', 'src'),
        ],
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?limit=10000&mimetype=image/svg+xml' },
      {
        test: /\.(png|jpg|jpeg)?$/, use: 'file-loader?limit=10000&mimetype=image/svg+xml',
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      CLIENT: true,
      SERVER: false,
      DEVELOPMENT: true,
      PORT: 3000,  // server
      SOCKET_PORT: 2999,  // websocket
    }),
  ],
}
