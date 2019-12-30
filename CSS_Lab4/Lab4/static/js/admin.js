let ipcRenderer = require('electron').ipcRenderer
let mysql = require('mysql')
let log4js = require('log4js')
let log_path = ipcRenderer.sendSync('get_log_path')
log4js.configure({
  appenders: { bank: { type: 'file', filename: log_path } },
  categories: { default: { appenders: ['bank'], level: 'info' } }
})
const logger = log4js.getLogger('bank')

let current_msg
let current_user_socket
let confirm_dialog = document.querySelector("#confirm_dialog")

let no_user_back = document.querySelector('#common_error_back')
no_user_back.addEventListener('click', (e) => {
  ipcRenderer.send('return_login')
})

let common_error_noreturn = document.querySelector('#common_error_noreturn')
common_error_noreturn.addEventListener('click', (e) => {
  document.querySelector('#common_error_dialog_noreturn').close()
})

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'lab4',
  multipleStatements: true
})

connection.connect((error) => {
  if (error) {
    document.querySelector('#common_error_msg').innerHTML = '无法连接数据库！\n' + error
    document.querySelector('#common_error_dialog').showModal()
    logger.error('连接数据库失败, ' + error)
  }
})

function render_row(data) {
  let html = '<tr class="data_row"><td>@ID</td> \
  <td class="mdl-data-table__cell--non-numeric">@NAME</td> \
  <td class="mdl-data-table__cell--non-numeric">@CURRENCY</td> \
  </tr>'
  html = html.replace(new RegExp("@ID", "g"), data.id)
  html = html.replace(new RegExp("@NAME", "g"), data.username)
  html = html.replace(new RegExp("@CURRENCY", "g"), data.currency)
  
  return html
}

function render_table(data) {
  let inner_html = ''
  for (let i = 0; i < data.length; i++) {
    inner_html += render_row(data[i])
  }
  document.querySelector('#data_table_body').innerHTML = inner_html
}

function query_all() {
  let query_all_info = 'use lab4; call queryalluser();'
  connection.query(query_all_info, (error, result) => {
    if (error) {
      document.querySelector('#common_error_msg').innerHTML = '未知错误！\n' + error
      document.querySelector('#common_error_dialog').showModal()
      logger.error('查询信息时出现未知错误, ' + error)
    } else {
      if (result.length == 0) return
      else {
        logger.info('管理员查询了所有用户的信息')
        render_table(result[1])
      }
    }
  })
}

query_all()

let return_login = document.querySelector('#return_login')
return_login.addEventListener('click', (e) => {
  ipcRenderer.send('return_login')
  server.close()
})

document.querySelector("#confirm_dialog_ok").addEventListener('click', (e) => {
  confirm_dialog.close()
  let new_currency
  if(current_msg.operation == 'deposit') {
    new_currency = parseFloat(current_msg.currency) + parseFloat(current_msg.money)
  } else {
    new_currency = parseFloat(current_msg.currency) - parseFloat(current_msg.money)
  }
  
  connection.beginTransaction((error) => {
    if (error) {
      logger.error('修改用户 ' + current_msg.username + ' 余额失败：开启事务失败')
      document.querySelector('#common_error_msg_noreturn').innerHTML = '开启事务失败！\n' + error
      document.querySelector('#common_error_dialog_noreturn').showModal()
      current_user_socket.write(JSON.stringify({
        code: -1,
        money: current_msg.currency,
        msg: '远程服务器开启事务失败'
      }))
    } else {
      let update_currency_sql = 'use lab4; call changecurrencybyusername(\'' + current_msg.username + '\', ' + new_currency + ');'
      connection.query(update_currency_sql, (error, result) => {
        if (error) {
          logger.error('修改用户 ' + current_msg.username + ' 余额失败：数据库操作失败')
          connection.rollback()
          document.querySelector('#common_error_msg_noreturn').innerHTML = '修改currency失败！事务回滚\n' + error
          document.querySelector('#common_error_dialog_noreturn').showModal()
          current_user_socket.write(JSON.stringify({
            code: -1,
            money: current_msg.currency,
            msg: '远程服务器执行事务失败'
          }))
        } else {
          connection.commit((error) => {
            if(error) {
              logger.error('修改用户 ' + current_msg.username + ' 余额失败：数据库操作失败')
              document.querySelector('#common_error_msg_noreturn').innerHTML = '提交修改currency事务失败！\n' + error
              document.querySelector('#common_error_dialog_noreturn').showModal()
              current_user_socket.write(JSON.stringify({
                code: -1,
                money: current_msg.currency,
                msg: '远程服务器提交事务失败'
              }))
            } else {
              logger.info('用户 ' + current_msg.username + ' ' + (current_msg.operation=='deposit'?'存入 ':'取出 ') + current_msg.money + ' 成功！余额 ' + new_currency + ' 元')
              msg = {
                code: 0,
                money: new_currency,
                msg: '执行成功'
              }
              current_user_socket.write(JSON.stringify(msg))
            }
          })
        }
        query_all()
      })
    }
  })
})

document.querySelector("#confirm_dialog_no").addEventListener('click', (e) => {
  confirm_dialog.close()
  current_user_socket.write(JSON.stringify({
    code: -1,
    money: current_msg.currency,
    msg: '操作被管理员拒绝'
  }))
  logger.info('管理员拒绝了用户 ' + current_msg.username + ' 的操作')
})

let net = require('net')
let listen_port = 8080
let server = net.createServer((socket) => {
  socket.setEncoding('utf8')
  socket.on('data', (data_str) => {
    let data = JSON.parse(data_str)

    logger.info('获得用户 ' + data.username + ' 请求 ' + (data.operation=='deposit'?'存入 ':'取出 ') + data.money + ' 元')

    let find_currency_sql = 'use lab4; call querysingleusercurrency(\'' + data.username + '\');'
    connection.query(find_currency_sql, (error, result) => {
      if(error) {
        logger.error('获取用户 ' + data.username + ' 余额失败！' + error)
        socket.write(JSON.stringify({
          code: -1,
          money: current_msg.currency,
          msg: '远程服务器错误'
        }))
        document.querySelector('#common_error_msg_noreturn').innerHTML = '查询curency失败！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
      } else {
        if(!result[1] || result[1].length == 0) {
          logger.error('获取用户 ' + data.username + ' 信息失败！')
          socket.write(JSON.stringify({
            code: -1,
            money: current_msg.currency,
            msg: '远程服务器错误'
          }))
          document.querySelector('#common_error_msg_noreturn').innerHTML = '无此用户！\n' + error
          document.querySelector('#common_error_dialog_noreturn').showModal()
          return
        }
        let personal_currency = result[1][0].currency
        if (data.operation == 'withdraw' && personal_currency < data.money) {
          logger.warn('用户 ' + data.username + ' 请求失败：余额不足')
          socket.write(JSON.stringify({
            code: -1,
            money: personal_currency,
            msg: '余额不足！'
          }))
        } else {
          current_msg = data
          current_msg.currency = personal_currency
          current_user_socket = socket;
          document.querySelector("#dialog_username").innerHTML = current_msg.username
          document.querySelector("#dialog_operation").innerHTML = (current_msg.operation=='deposit'?'存入':'取出')
          document.querySelector("#dialog_money").innerHTML = current_msg.money
          document.querySelector("#dialog_currency").innerHTML = current_msg.currency
          confirm_dialog.showModal()
        }
      }
    })

  })
}).listen(listen_port)
server.on('listening', function () {
  logger.info('服务器监听端口 ' + listen_port)
})
