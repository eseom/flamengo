require('babel-polyfill')
require('./boot')

if (module.hot) {
  module.hot.accept(() => {
    require('./boot')
  })
}
