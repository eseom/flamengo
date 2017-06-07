const settings = require('../settings')

module.exports = settings[process.env.NODE_ENV || 'development'].database
