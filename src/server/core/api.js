import Boom from 'boom'
import { server } from 'hails'

const route = server.route

route.get('/', { }, async (request, reply) => {
  reply.redirect('/super/home')
})

route.get('/favicon.ico', {}, {
  file: `${__dirname}/../static/favicon.ico`,
})

route.get('/static/{p*}', {}, {
  directory: {
    path: `${__dirname}/../../../static`,
  },
})

route.any('/api/{p*}', {}, async (request, reply) => {
  reply(Boom.notFound('NOT FOUND'))
})

route.get('/api/test', {}, (request, reply) => {
  reply({ test: 'test' })
})

/* nes test */
route.get('/api/h', {
  id: 'hello',
}, (request, reply) => {
  reply('world!!!!')
})
