import Boom from 'boom'
import { server as hailsServer, logger } from 'hails'
import Vue from 'vue'
import settingsFile from '../../settings'

const settings = settingsFile[process.env.NODE_ENV || 'development']

settings.plugins = [
  { register: require('hapi-nested-route') },
]

// connection handler
const internals = {
  connection() {
    return {
      authenticate(request, reply) {
        const database = request.yar.get('database')
        if (!database) {
          reply(Boom.unauthorized('no connection'), null, {})
          return
        }

        // update session ttl
        request.yar.set('database', database)
        request.database = database
        reply.continue({
          credentials: {},
        })
      },
    }
  },
}

settings.auths = [
  ['connectionRequired', internals.connection],
]

const app = new Vue({
  render(h) {
    return ''
  },
})
const renderer = require('vue-server-renderer').createRenderer()

hailsServer.init(settings)
  .then((done) => {
    hailsServer.route({
      path: '/{p*}',
      method: 'get',
      handler: (request, reply) => {
        renderer.renderToString(app, (error, html) => {
          if (error) throw error

          const scriptTags = Object.keys(assets).filter(key => typeof assets[key].js !== 'undefined').map(key => `<script src="${assets[key].js}"></script>`)
          const linkTags = Object.keys(assets).filter(key => typeof assets[key].css !== 'undefined').map(key => `<link href="${assets[key].css}" rel="stylesheet">`)

          reply(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css?family=Ubuntu+Mono" rel="stylesheet">
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">

                ${linkTags.join('')}
              </head>
              <body>
                <div class="app" id="app">
                  ${html}
                </div>
                ${scriptTags.join('')}
              </body>
            </html>
          `.replace(/\s{2,}/g, ' ').replace(/> </g, '><').trim())
        })
      },
    })
    done()
    logger.info(`✅ server has started at ${hailsServer.info.uri}`)
  })
  .catch((e) => {
    logger.error(e)
  })
