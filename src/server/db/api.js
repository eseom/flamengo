import Joi from 'joi'
import Boom from 'boom'
import { server, logger } from 'hails'
import Sequelize from 'sequelize'
import databases from './databases'

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

  const { query } = request.payload
  let finalQuery = ''

  // query
  if (query.substring(0, 1) === '\\') {
    switch (query.substring(1)) {
      case 'd':
        finalQuery = `SELECT n.nspname as "Schema",
  c.relname as "Name",
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'i' THEN 'index' WHEN 'S' THEN 'sequence' WHEN 's' THEN 'special' WHEN 'f' THEN 'foreign table' END as "Type",
  pg_catalog.pg_get_userbyid(c.relowner) as "Owner"
FROM pg_catalog.pg_class c
     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r','v','m','S','f','')
      AND n.nspname <> 'pg_catalog'
      AND n.nspname <> 'information_schema'
      AND n.nspname !~ '^pg_toast'
  AND pg_catalog.pg_table_is_visible(c.oid)
ORDER BY 1,2;`
        break
      case 'dt':
        finalQuery = `SELECT n.nspname as "Schema",
  c.relname as "Name",
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'i' THEN 'index' WHEN 'S' THEN 'sequence' WHEN 's' THEN 'special' WHEN 'f' THEN 'foreign table' END as "Type",
  pg_catalog.pg_get_userbyid(c.relowner) as "Owner"
FROM pg_catalog.pg_class c
     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r','')
      AND n.nspname <> 'pg_catalog'
      AND n.nspname <> 'information_schema'
      AND n.nspname !~ '^pg_toast'
  AND pg_catalog.pg_table_is_visible(c.oid)
ORDER BY 1,2;`
        break
      case 'l':
        finalQuery = `SELECT d.datname as "Name",
       pg_catalog.pg_get_userbyid(d.datdba) as "Owner",
       pg_catalog.pg_encoding_to_char(d.encoding) as "Encoding",
       d.datcollate as "Collate",
       d.datctype as "Ctype",
       pg_catalog.array_to_string(d.datacl, E'\n') AS "Access privileges"
FROM pg_catalog.pg_database d
ORDER BY 1;`
        break
      default:
        break
    }
  } else {
    finalQuery = query
  }
  databases[dbname].query(finalQuery).spread((result) => {
    // setTimeout(() => {
    reply({ result })
    // }, 1000)
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
