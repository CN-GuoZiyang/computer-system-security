let ipcRenderer = require('electron').ipcRenderer
let net = require('net')
let mysql = require('mysql')
let admin_port = 8080
let admin_host = '127.0.0.1'
let log4js = require('log4js')
let log_path = ipcRenderer.sendSync('get_log_path')
log4js.configure({
  appenders: { bank: { type: 'file', filename: log_path } },
  categories: { default: { appenders: ['bank'], level: 'info' } }
})
const logger = log4js.getLogger('bank')

let username = ''
let currency = document.querySelector('#currency')

let return_login = document.querySelector('#return_login')
return_login.addEventListener('click', (e) => {
    ipcRenderer.send('return_login')
})

let no_user_back = document.querySelector('#common_error_back')
no_user_back.addEventListener('click', (e) => {
    ipcRenderer.send('return_login')
})

username = ipcRenderer.sendSync('getUser');
document.querySelector('#username').innerHTML = username

let connection = mysql.createConnection({
    host: 'localhost',
    user: username,
    password: username,
    database: 'lab3'
})

let logined = true
connection.connect((error) => {
    if (error) {
        logger.error('尝试登陆失败！无此用户：' + username)
        document.querySelector('#common_error_msg').innerHTML = '无此用户！'
        document.querySelector('#common_error_dialog').showModal()
        logined = false
    }
})

function refresh_currency() {
    let currency_select_sql = 'SELECT currency FROM lab3.bank WHERE username=\'' + username + '\' and valid=true'
    connection.query(currency_select_sql, (error, result) => {
        if (error) {
            logger.error('查询余额错误！' + error)
            document.querySelector('#common_error_msg').innerHTML = '查询数据库错误！' + error
            document.querySelector('#common_error_dialog').showModal()
        } else if (!result || result.length == 0) {
            logger.error('查询余额错误！查询不到此用户信息！')
            document.querySelector('#common_error_msg').innerHTML = '无此用户！'
            document.querySelector('#common_error_dialog').showModal()
        } else {
            currency.innerHTML = result[0].currency
        }
    })
}

if (logined) {
    refresh_currency()
}



document.querySelector('#refresh_currency').addEventListener('click', (e) => {
    refresh_currency()
})

let deposit_btn = document.querySelector("#deposit")
let deposit_dialog = document.querySelector("#deposit_dialog")

deposit_btn.addEventListener('click', (e) => {
    deposit_dialog.showModal()
})

let deposit_close_dialog = document.querySelector("#deposit_close_dialog")
let deposit_confirm_dialog = document.querySelector('#deposit_confirm_dialog')
let deposit_money = document.querySelector("#deposit_money")
deposit_close_dialog.addEventListener('click', (e) => {
    deposit_dialog.close()
    deposit_money.value = ''
})
deposit_confirm_dialog.addEventListener('click', (e) => {
    let money = deposit_money.value
    if (typeof money == 'undefined' || money == null || money == '' || !/^[0-9]*$/.test(money) || parseFloat(money) <= 0) {
        window.alert('输入不合法！')
        return
    }

    logger.info('用户 ' + username + ' 尝试存入 ' + money + ' 元')

    let client = new net.Socket();
    client.setEncoding('utf8')
    client.connect(admin_port, admin_host, () => {
        client.write(JSON.stringify({
            username: username,
            operation: 'deposit',
            money: money
        }))
    })
    let result;
    client.on('data', (data) => {
        result = JSON.parse(data)
        if (result.code != 0) {
            logger.warn('用户操作失败！' + result.msg)
            window.alert('操作失败！' + result.msg)
        } else {
            logger.info('用户操作成功！')
        }
        console.log(result)
        deposit_dialog.close()
        currency.innerHTML = result.money
    })

    client.on('error', (error) => {
        window.alert('操作失败！' + error)
        client.destroy()
        deposit_dialog.close()
    })

    client.on('close', () => { })
})



let withdraw_btn = document.querySelector("#withdraw")
let withdraw_dialog = document.querySelector("#withdraw_dialog")

withdraw_btn.addEventListener('click', (e) => {
    withdraw_dialog.showModal()
})

let withdraw_close_dialog = document.querySelector("#withdraw_close_dialog")
let withdraw_confirm_dialog = document.querySelector('#withdraw_confirm_dialog')
let withdraw_money = document.querySelector("#withdraw_money")
withdraw_close_dialog.addEventListener('click', (e) => {
    withdraw_dialog.close()
    withdraw_money.value = ''
})
withdraw_confirm_dialog.addEventListener('click', (e) => {
    let money = withdraw_money.value
    if (typeof money == 'undefined' || money == null || money == '' || !/^[0-9]*$/.test(money) || parseFloat(money) <= 0) {
        window.alert('输入不合法！')
        return
    }

    logger.info('用户 ' + username + ' 尝试取出 ' + money + ' 元')

    let client = new net.Socket();
    client.setEncoding('utf8')
    client.connect(admin_port, admin_host, () => {
        client.write(JSON.stringify({
            username: username,
            operation: 'withdraw',
            money: money
        }))
    })
    let result;
    client.on('data', (data) => {
        result = JSON.parse(data)
        if (result.code != 0) {
            logger.warn('用户操作失败！' + result.msg)
            window.alert('操作失败！' + result.msg)
        } else {
            logger.info('用户操作成功！')
        }
        withdraw_dialog.close()
        currency.innerHTML = result.money
    })
    client.on('error', (error) => {
        window.alert('操作失败！' + error)
        client.destroy()
        withdraw_dialog.close()
        return
    })
    client.on('close', () => { });
})

let common_error_noreturn = document.querySelector('#common_error_noreturn')
common_error_noreturn.addEventListener('click', (e) => {
    document.querySelector('#common_error_dialog_noreturn').close()
})

document.querySelector('#all_sql_btn').addEventListener('click', (e) => {
    document.querySelector('#sql_dialog_text').value = ''
    document.querySelector('#all_sql_dialog').showModal()
})

document.querySelector('#sql_confirm_dialog').addEventListener('click', (e) => {
    document.querySelector('#all_sql_dialog').close()
    run_all_sql(document.querySelector('#sql_dialog_text').value)
})

document.querySelector('#sql_close_dialog').addEventListener('click', (e) => {
    document.querySelector('#all_sql_dialog').close()
})

function run_all_sql(sql) {
    logger.info('尝试执行SQL：' + sql)
    connection.query(sql, (error, result) => {
        if (error) {
            logger.error('尝试执行SQL失败！' + error)
            document.querySelector('#common_error_msg_noreturn').innerHTML = '执行失败\n' + error
            document.querySelector('#common_error_dialog_noreturn').showModal()
        } else {
            logger.info('执行SQL成功！')
            document.querySelector('#common_error_msg_noreturn').innerHTML = JSON.stringify(result).replace(new RegExp(",", "g"), ', ')
            document.querySelector('#common_error_dialog_noreturn').showModal()
        }
    })
}