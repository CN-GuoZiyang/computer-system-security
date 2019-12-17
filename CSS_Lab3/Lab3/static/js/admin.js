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
  database: 'lab3',
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
  <td class="mdl-data-table__cell--non-numeric"><input class="mdl-textfield__input" type="text" \
      value="@CURRENCY"></td> \
  <td class="mdl-data-table__cell--non-numeric"><input class="mdl-textfield__input" type="checkbox" @SELECT></td> \
  <td class="mdl-data-table__cell--non-numeric"><input class="mdl-textfield__input" type="checkbox" @UPDATE></td> \
  <td class="mdl-data-table__cell--non-numeric"><input class="mdl-textfield__input" type="checkbox" @VALID></td> \
</tr>'
  html = html.replace(new RegExp("@ID", "g"), data.id)
  html = html.replace(new RegExp("@NAME", "g"), data.username)
  html = html.replace(new RegExp("@CURRENCY", "g"), data.currency)
  if (!data.Column_priv) {
    data.Column_priv = ''
  }
  html = html.replace("@SELECT", data.Column_priv.includes('Select') ? 'checked' : '')
  html = html.replace("@UPDATE", data.Column_priv.includes('Update') ? 'checked' : '')
  html = html.replace("@VALID", data.valid == 1 ? 'checked' : '')
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
  let query_all_info = 'SELECT lab3.bank.*,mysql.columns_priv.Column_priv FROM lab3.bank LEFT JOIN mysql.columns_priv ON lab3.bank.username = mysql.columns_priv.User AND mysql.columns_priv.Column_name=\'currency\' ORDER BY lab3.bank.id'
  connection.query(query_all_info, (error, result) => {
    if (error) {
      document.querySelector('#common_error_msg').innerHTML = '未知错误！\n' + error
      document.querySelector('#common_error_dialog').showModal()
      logger.error('查询信息时出现未知错误, ' + error)
    } else {
      if (result.length == 0) return
      else {
        render_table(result)
        bind_event()
      }
    }
  })
}

query_all()

function bind_event() {
  let data_row = document.querySelectorAll(".data_row")
  for (let i = 0; i < data_row.length; i++) {
    let name = data_row[i].querySelectorAll('td')[1].innerHTML
    let inputs = data_row[i].querySelectorAll('input')
    inputs[0].addEventListener('keydown', (e) => {
      if(e.keyCode === 13) {
        change_currency_by_username(inputs[0].value, name)
      }
    })
    inputs[1].addEventListener('click', (e) => {
      change_select_priv(name, inputs[1])
    })
    inputs[2].addEventListener('click', (e) => {
      change_update_priv(name, inputs[2])
    })
    inputs[3].addEventListener('click', (e) => {
      change_valid(name, inputs[3])
    })
  }
}

function change_select_priv(name, tag) {
  if (tag.checked) {
    let grant_select_priv_sql = 'GRANT SELECT(currency) ON lab3.bank TO \'' + name + '\'@\'localhost\';FLUSH PRIVILEGES'
    connection.query(grant_select_priv_sql, (error, result) => {
      if (error) {
        logger.error('授予SELECT(currency)权限给 ' + name + ' 失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法授予权限 SELECT(currency) 给 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('授予SELECT(currency)权限给 ' + name)
      }
    })
  } else {
    let revoke_select_priv_sql = 'REVOKE SELECT(currency) ON lab3.bank FROM \'' + name + '\'@\'localhost\';FLUSH PRIVILEGES'
    connection.query(revoke_select_priv_sql, (error, result) => {
      if (error) {
        logger.error('收回SELECT(currency)权限从 ' + name + ' 失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法收回权限 SELECT(currency) 从 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('收回SELECT(currency)权限从 ' + name)
      }
    })
  }
}

function change_update_priv(name, tag) {
  if (tag.checked) {
    let grant_update_priv_sql = 'GRANT UPDATE(currency) ON lab3.bank TO \'' + name + '\'@\'localhost\';FLUSH PRIVILEGES'
    connection.query(grant_update_priv_sql, (error, result) => {
      if (error) {
        logger.error('授予UPDATE(currency)权限给 ' + name + ' 失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法授予权限 UPDATE(currency) 给 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('授予UPDATE(currency)权限给 ' + name)
      }
    })
  } else {
    let revoke_update_priv_sql = 'REVOKE UPDATE(currency) ON lab3.bank FROM \'' + name + '\'@\'localhost\';FLUSH PRIVILEGES'
    connection.query(revoke_update_priv_sql, (error, result) => {
      if (error) {
        logger.error('收回UPDATE(currency)权限从 ' + name + ' 失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法收回权限 UPDATE(currency) 从 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('收回UPDATE(currency)权限从 ' + name)
      }
    })
  }
}

function change_valid(name, tag) {
  if (tag.checked) {
    let update_valid_sql = 'UPDATE lab3.bank SET valid=true WHERE username=\'' + name + '\''
    connection.query(update_valid_sql, (error, result) => {
      if (error) {
        logger.error('将用户 ' + name + ' 置为有效失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法设置用户 ' + name + ' 为有效！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('将用户 ' + name + ' 置为有效')
      }
    })
  } else {
    let revoke_valid_sql = 'UPDATE lab3.bank SET valid=false WHERE username=\'' + name + '\''
    connection.query(revoke_valid_sql, (error, result) => {
      if (error) {
        logger.error('将用户 ' + name + ' 置为无效失败！' + error)
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法设置用户 ' + name + ' 为无效！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      } else {
        logger.info('将用户 ' + name + ' 置为无效')
      }
    })
  }
}

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
    logger.info('用户 ' + current_msg.username + ' 发起事务：存入 ' + current_msg.money + ' 元')
  } else {
    new_currency = parseFloat(current_msg.currency) - parseFloat(current_msg.money)
    logger.info('用户 ' + current_msg.username + ' 发起事务：取出 ' + current_msg.money + ' 元')
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
      let update_currency_sql = 'UPDATE lab3.bank SET currency=' + new_currency + ' WHERE username=\'' + current_msg.username + '\''
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
              logger.info('用户 ' + current_msg.username + ' ' + current_msg.operation=='deposit'?'存入 ':'取出 ' + current_msg.money + ' 成功！余额 ' + new_currency + ' 元')
              msg = {
                code: 0,
                money: new_currency,
                msg: '执行成功'
              }
              console.log(msg)
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
})

let net = require('net')
let listen_port = 8080
let server = net.createServer((socket) => {
  socket.setEncoding('utf8')
  socket.on('data', (data_str) => {
    let data = JSON.parse(data_str)

    logger.info('获得用户 ' + data.username + ' 请求 ' + data.operation=='deposit'?'存入 ':'取出 ' + data.money + ' 元')

    let find_currency_sql = 'SELECT currency FROM lab3.bank WHERE username=\'' + data.username + '\'';
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
        if(!result || result.length == 0) {
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
        let personal_currency = result[0].currency
        if (data.operation == 'withdraw' && personal_currency < data.money) {
          logger.error('用户 ' + data.username + ' 请求失败：余额不足')
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
          document.querySelector("#dialog_operation").innerHTML = current_msg.operation=='deposit'?'存入':'取出'
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

function change_currency_by_username(currency, username) {
  logger.info('管理员尝试修改用户 ' + username + ' 余额为 ' + currency + '元')
  connection.beginTransaction((error) => {
    if (error) {
      logger.error('修改用户 ' + username + ' 余额失败：开启事务失败！' + error)
      document.querySelector('#common_error_msg_noreturn').innerHTML = '开启事务失败！\n' + error
      document.querySelector('#common_error_dialog_noreturn').showModal()
    } else {
      let update_currency_sql = 'UPDATE lab3.bank SET currency=' + currency + ' WHERE username=\'' + username + '\''
      connection.query(update_currency_sql, (error, result) => {
        if (error) {
          logger.error('修改用户 ' + username + ' 余额失败：执行事务失败！' + error)
          connection.rollback()
          document.querySelector('#common_error_msg_noreturn').innerHTML = '修改currency失败！事务回滚\n' + error
          document.querySelector('#common_error_dialog_noreturn').showModal()
        } else {
          connection.commit((error) => {
            if(error) {
              logger.error('修改用户 ' + username + ' 余额失败：提交事务失败！' + error)
              document.querySelector('#common_error_msg_noreturn').innerHTML = '提交修改currency事务失败！\n' + error
              document.querySelector('#common_error_dialog_noreturn').showModal()
            } else {
              logger.info('管理员成功修改用户 ' + username + ' 余额为 ' + currency + '元')
            }
          })
        }
        query_all()
      })
    }
  })
}

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
    if(error) {
      logger.error('执行SQL失败：' + error)
      document.querySelector('#common_error_msg_noreturn').innerHTML = '执行失败\n' + error
      document.querySelector('#common_error_dialog_noreturn').showModal()
    } else {
      logger.info('执行SQL成功！')
      document.querySelector('#common_error_msg_noreturn').innerHTML = JSON.stringify(result).replace(new RegExp(",", "g"), ', ')
      document.querySelector('#common_error_dialog_noreturn').showModal()
    }
  })
}

document.querySelector('#add_btn').addEventListener('click', (e) => {
  document.querySelector('#add_user_dialog').showModal()
})

document.querySelector('#add_close_dialog').addEventListener('click', (e) => {
  document.querySelector('#add_username').value = ''
  document.querySelector('#add_currency').value = ''
  document.querySelector('#add_user_dialog').close()
})

document.querySelector('#add_confirm_dialog').addEventListener('click', (e) => {
  let add_username = document.querySelector('#add_username').value
  let add_currency = document.querySelector('#add_currency').value
  logger.info('尝试添加用户 ' + add_username + ' ，余额为 ' + add_currency + '元')
  let add_user_sql = 'DROP USER if EXISTS \'' + add_username + '\'@\'localhost\';CREATE USER \'' + add_username + '\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'' + add_username + '\';GRANT select(currency), select(username), select(valid) ON lab3.bank TO \'' + add_username + '\'@\'localhost\';FLUSH PRIVILEGES;INSERT INTO lab3.bank(username, currency, valid) VALUES (\'' + add_username + '\', ' + add_currency + ', true);'
  connection.beginTransaction((error) => {
    if (error) {
      logger.error('添加用户' + add_username + '失败！开启事务失败！' + error)
      document.querySelector('#common_error_msg_noreturn').innerHTML = '添加用户失败！开启事务失败！\n' + error
      document.querySelector('#common_error_dialog_noreturn').showModal()
    } else {
      connection.query(add_user_sql, (error, result) => {
        if (error) {
          logger.error('添加用户' + add_username + '失败！执行事务失败！' + error)
          connection.rollback()
          document.querySelector('#common_error_msg_noreturn').innerHTML = '添加用户失败！事务回滚\n' + error
          document.querySelector('#common_error_dialog_noreturn').showModal()
        } else {
          connection.commit((error) => {
            if(error) {
              logger.error('添加用户' + add_username + '失败！提交事务失败！' + error)
              document.querySelector('#common_error_msg_noreturn').innerHTML = '添加用户事务失败！\n' + error
              document.querySelector('#common_error_dialog_noreturn').showModal()
            } else {
              logger.info('成功添加用户 ' + add_username + ' ，余额为 ' + add_currency + '元')
            }
          })
        }
        document.querySelector('#add_user_dialog').close()
        query_all()
      })
    }
  })
})