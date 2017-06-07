import { server } from 'hails'
import { broker } from '../core/broker'

const { scheduler } = server

scheduler.register('query.testCamelCase', (job, done) => {
  broker.lpush('jobs', JSON.stringify({
    key: 'query.testCamelCase',
    kwargs: { a: 'a', b: 'b', c: 'c' },
  }))
  done()
})
