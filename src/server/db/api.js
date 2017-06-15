import Joi from 'joi'
import Boom from 'boom'
import { server, logger } from 'hails'
import Sequelize from 'sequelize'
import databases from './databases'
import * as query from './query'

const nestedRoute = server.route.nested('/api/db')

const connect = async (dsn, realDsn) => {
  if (!databases[dsn]) {
    databases[dsn] = new Sequelize(realDsn, {
      logging: process.env.NODE_ENV !== 'production' ? logger.info : false,
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: false,
      },
    })
  }
  try {
    const result = await databases[dsn].query('SELECT VERSION();')
    return {
      version: result[0][0].version,
    }
  } catch (e) {
    logger.error(e)
    delete databases[dsn]
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
  databases[dbname].query(finalQuery).spread((results) => {
    // adjust date type
    results = results.map((result) => {
      Object.keys(result).forEach((k) => {
        if (result[k] instanceof Date) {
          result[k] = `\x20\x10${result[k].toISOString()}`
        }
      })
      return result
    })

    if (!results) results = []
    else if (!Array.isArray(results)) results = [results]
    reply({ results })
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
  const dsn = dsnTemplate.replace('__REPLACE__', '')
  const realDsn = dsnTemplate.replace('__REPLACE__', `:${request.payload.password}`)

  try {
    const { version } = await connect(dsn, realDsn)
    request.yar.set('database', {
      dsn, // password removed dsn
      version,
    })
    // not send to client
    request.yar.set('dsn', realDsn)
    reply({ host: request.payload.host })
  } catch (e) {
    reply(Boom.unauthorized('connection refused.'))
  }
})

nestedRoute.get('/load-connection', {
  description: 'load the connection',
  tags: ['api', 'db'],
}, async (request, reply) => {
  const database = request.yar.get('database')
  if (database) {
    const session = request.yar.get('database')
    reply({
      dsn: session.dsn,
      version: session.version,
    })
  } else reply(Boom.unauthorized('not logged in'))
})

nestedRoute.post('/disconnect', {
  description: 'disconnect',
  tags: ['api', 'db'],
}, async (request, reply) => {
  const { dsn } = request.yar.get('database')
  request.yar.clear('database')
  request.yar.clear('dsn')
  if (databases[dsn]) {
    databases[dsn].close()
    delete databases[dsn]
  }
  reply({ result: true })
})
