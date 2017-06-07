#!/usr/bin/env node
/* eslint import/no-extraneous-dependencies: "off" */

require('../tools/babel-require')

global.CLIENT = false
global.SERVER = true
global.DISABLE_SSR = false
global.DEVELOPMENT = process.env.NODE_ENV !== 'production'

if (DEVELOPMENT) {
  global.assets = {
    main: {
      js: 'http://localhost:3001/bundle.js',
    },
  }
} else {
  global.assets = require('../webpack-assets.json')
}

require('../src/server')
