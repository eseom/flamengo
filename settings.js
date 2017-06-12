module.exports = {
  development: {
    version: '0.1',
    connection: {
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || 3000,
    },
    port: process.env.PORT,
    socketPort: process.env.SOCKET_PORT,
    modules: [
      'core',
      'user',
      'db',
    ],
    broker: {
      url: process.env.REDIS,
    },
    redis: {
      url: process.env.REDIS,
    },
    schedules: [
    ],
    useSequelize: false,
    database: {
      storage: 'flamengo.db',
      dialect: 'sqlite',
    },
  },
}
