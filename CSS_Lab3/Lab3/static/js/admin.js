let ipcRenderer = require('electron').ipcRenderer
let mysql = require('mysql')
let return_login = document.querySelector('#return_login')

let current_msg
let current_user_socket
let confirm_dialog = document.querySelector("#confirm_dialog")

let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'lab3'
})

connection.connect((error) => {
  
})

let query_all_info = 'SELECT id, username, valid, Table_priv FROM lab3.bank,mysql.tables_priv WHERE lab3.bank.username = mysql.tables_priv.User ORDER BY id'
connection.query(query_all_info, (error, result) => {
  if(error) {
    console.log(error)
  } else {
    console.log(result)
  }
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
    
    if(data.operation == 'withdraw' && personal_currency > money) {
      socket.write({
        code: -1,
        money: personal_currency
      })
      return
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
server.on('listening',function(){
  console.log("server listening:" + server.address().port);
});

return_login.addEventListener('click', (e) => {
    ipcRenderer.send('return_login')
    server.close()
})

// TODO 按照data中的username查找余额
function find_currency_by_username(name) {
  return 20
}