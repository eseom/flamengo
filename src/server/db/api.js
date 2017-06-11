import Joi from 'joi'
import Boom from 'boom'
import { server, logger } from 'hails'
import Sequelize from 'sequelize'
import databases from './databases'
import * as query from './query'

const nestedRoute = server.route.nested('/api/db')

const connect = async (key, dsn) => {
  if (!databases[key]) {
    databases[key] = new Sequelize(dsn, {
      logging: process.env.NODE_ENV !== 'production' ? logger.info : false,
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: false,
      },
    })
  }
  try {
    await databases[key].query('set statement_timeout = 0;')
  } catch (e) {
    console.log(e)
    delete databases[key]
    throw e
  }
}

nestedRoute.post('/query', {
  description: 'execute query',
  tags: ['api', 'db'],
  validate: {
    payload: {
      query: Joi.string().required(),
    },
  },
  auth: 'connectionRequired',
}, (request, reply) => {
  const dbname = request.yar.get('database')
  if (request.yar.get('dsn')) {
    connect(dbname, request.yar.get('dsn'))
  }

  const queryString = request.payload.query
  let finalQuery = ''

  // query
  if (queryString.substring(0, 1) === '\\') {
    try {
      finalQuery = query.getSlashCommandQuery(queryString)
    } catch (e) {
      if (e instanceof query.NotImplementException) {
        reply(Boom.badGateway('not implemented. suggest new features at https://github.com/eseom/flamengo/issues'))
        return
      }
      throw e
    }
  } else {
    finalQuery = queryString
  }
  databases[dbname].query(finalQuery).spread((result) => {
    if (!result) result = []
    else if (!Array.isArray(result)) result = [result]
    reply({ result })
  }).catch((e) => {
    reply(Boom.badRequest(e.message))
  })
})

nestedRoute.post('/connect', {
  description: 'connect to database server',
  tags: ['api', 'db'],
  validate: {
    payload: {
      host: Joi.string().required(),
      port: Joi.number().integer().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      dbname: Joi.string().required(),
    },
  },
}, async (request, reply) => {
  const dsnTemplate = `postgres://${request.payload.username}__REPLACE__@${request.payload.host}:${request.payload.port}/${request.payload.dbname}`

  // TODO already connected connection
  const key = dsnTemplate.replace('__REPLACE__', '')
  const dsn = dsnTemplate.replace('__REPLACE__', `:${request.payload.password}`)

  try {
    await connect(key, dsn)
  } catch (e) {
    reply(Boom.unauthorized('connection refused.'))
    return
  }

  request.yar.set('database', key)
  request.yar.set('dsn', dsn)
  reply({ host: request.payload.host })
})

nestedRoute.get('/load-connection', {
  description: 'load the connection',
  tags: ['api', 'db'],
}, async (request, reply) => {
  const database = request.yar.get('database')
  if (database) reply({ dsn: request.yar.get('database') })
  else reply(Boom.unauthorized('not logged in'))
})

nestedRoute.post('/disconnect', {
  description: 'disconnect',
  tags: ['api', 'db'],
}, async (request, reply) => {
  const key = request.yar.get('database')
  request.yar.clear('database')
  request.yar.clear('dsn')
  if (databases[key]) {
    databases[key].close()
    delete databases[key]
  }
  reply({ result: true })
})
