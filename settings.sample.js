module.exports = {
  development: {
    version: '0.1',
    port: process.env.PORT,
    socketPort: process.env.SOCKET_PORT,
    modules: [
      'core',
      'user',
      'db',
    ],
    hostname: 'http://localhost:3000',
    broker: {
      url: 'redis://:dev@localhost:6379/9',
    },
    redis: {
      url: 'redis://:dev@localhost:6379/9',
    },
    schedules: [
      ['1 * * * *', 'db.test'],
    ],
    database: {
      storage: 'flamengo.db',
      dialect: 'sqlite',
    },
  },
}
