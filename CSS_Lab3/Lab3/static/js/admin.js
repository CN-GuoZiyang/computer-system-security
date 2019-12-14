let ipcRenderer = require('electron').ipcRenderer
let mysql = require('mysql')

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
  database: 'lab3'
})

connection.connect((error) => {
  if (error) {
    document.querySelector('#common_error_msg').innerHTML = '无法连接数据库！\n' + error
    document.querySelector('#common_error_dialog').showModal()
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
  html = html.replace("@SELECT", data.Table_priv.includes('Select') ? 'checked' : '')
  html = html.replace("@UPDATE", data.Table_priv.includes('Update') ? 'checked' : '')
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
  let query_all_info = 'SELECT id, username, currency, valid FROM lab3.bank,mysql.user WHERE lab3.bank.username = mysql.user.User ORDER BY id'
  connection.query(query_all_info, (error, result) => {
    if (error) {
      document.querySelector('#common_error_msg').innerHTML = '未知错误！\n' + error
      document.querySelector('#common_error_dialog').showModal()
    } else {
      if (result.length == 0) return
      else {
        for(let i = 0; i < result.length; i ++) {
          let query_priv = 'SELECT Table_priv FROM mysql.tables_priv WHERE `User`=\'' + result[i].username + '\''
          connection.query(query_priv, (error, res) => {
            console.log(res)
            if(res.length == 0) result[i].Table_priv = ''
            else result[i].Table_priv = res.Table_priv
          })
        }
        console.log(result)
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
  let param = [name]
  if(tag.checked) {
    let grant_select_priv_sql = 'GRANT SELECT ON lab3.bank TO \'?\'@\'localhost\';FLUSH PRIVILEGES;'
    connection.query(grant_select_priv_sql, param, (error, result) => {
      if(error) {
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法授予权限 SELECT 给 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      }
    })
  } else {
    let revoke_select_priv_sql = 'REVOKE SELECT ON lab3.bank FROM \'?\'@\'localhost\';FLUSH PRIVILEGES;'
    connection.query(revoke_select_priv_sql, param, (error, result) => {
      if(error) {
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法收回权限 SELECT 从 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      }
    })
  }
}

function change_update_priv(name, tag) {
  param = [name]
  if(tag.checked) {
    let grant_update_priv_sql = 'GRANT UPDATE ON lab3.bank TO \'?\'@\'localhost\';FLUSH PRIVILEGES;'
    connection.query(grant_update_priv_sql, param, (error, result) => {
      if(error) {
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法授予权限 UPDATE 给 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      }
    })
  } else {
    let revoke_update_priv_sql = 'REVOKE UPDATE ON lab3.bank FROM \'?\'@\'localhost\';FLUSH PRIVILEGES;'
    connection.query(revoke_update_priv_sql, param, (error, result) => {
      if(error) {
        document.querySelector('#common_error_msg_noreturn').innerHTML = '无法收回权限 UPDATE 从 ' + name + ' ！\n' + error
        document.querySelector('#common_error_dialog_noreturn').showModal()
        query_all()
      }
    })
  }
}

function change_valid(name, tag) {

}

let return_login = document.querySelector('#return_login')
return_login.addEventListener('click', (e) => {
  ipcRenderer.send('return_login')
  server.close()
})

document.querySelector("#confirm_dialog_ok").addEventListener('click', (e) => {
  confirm_dialog.close()
  //TODO 执行操作

  current_user_socket.write(JSON.stringify({

  }))
})

document.querySelector("#confirm_dialog_no").addEventListener('click', (e) => {
  confirm_dialog.close()
  current_user_socket.write(JSON.stringify({
    code: -1,
    money: current_msg.currency,
    msg: '操作被管理员拒绝'
  }))
  current_user_socket.close()
})

let net = require('net')
let listen_port = 8080
let server = net.createServer((socket) => {
  socket.setEncoding('utf8')
  socket.on('data', (data_str) => {
    let data = JSON.parse(data_str)

    let personal_currency = find_currency_by_username(data.username)

    if (data.operation == 'withdraw' && personal_currency > money) {
      socket.write({
        code: -1,
        money: personal_currency
      })
    } else {
      current_msg = data
      current_msg.currency = personal_currency
      current_user_socket = socket;
      document.querySelector("#dialog_username").innerHTML = current_msg.username
      document.querySelector("#dialog_operation").innerHTML = current_msg.operation
      document.querySelector("#dialog_money").innerHTML = current_msg.money
      document.querySelector("#dialog_currency").innerHTML = current_msg.currency
      confirm_dialog.showModal()
    }

  })
}).listen(listen_port)
server.on('listening', function () {
  console.log("server listening:" + server.address().port);
});

// TODO 按照data中的username查找余额
function find_currency_by_username(name) {
  return 20
}