let log4js = require('log4js')
let date = new Date().getTime()

log4js.configure({
    appenders: { logger: { type: 'file', filename: './static/log/' + date + '.log' } },
    categories: { default: { appenders: ['logger'], level: 'info' } }
})

let logger = log4js.getLogger('logger')

function init() {
    logger.info('日志记录开启')
}

module.exports.logger = logger

exports.init = init