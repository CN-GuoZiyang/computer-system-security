const log4js = require('log4js')

class Logger {

    constructor() {
        this.log4js = require('log4js')
        this.date = new Date().getTime()
        console.log(this.date)
        this.log4js.configure({
            appenders: { bank: { type: 'file', filename: './static/log/' + this.date + '.log' } },
            categories: { default: { appenders: ['bank'], level: 'info' } }
        })
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Logger()
        }
        return this.instance.log4js.getLogger('bank')
    }
}

module.exports = Logger