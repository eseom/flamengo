import Promise from 'bluebird'
import redisOriginal from 'redis'
import { server } from 'hails'

const redis = Promise.promisifyAll(redisOriginal)

export const broker = redis.createClient({
  url: server.config.broker.url,
})
