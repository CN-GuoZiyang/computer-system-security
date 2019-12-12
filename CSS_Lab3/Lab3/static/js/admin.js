let ipcRenderer = require('electron').ipcRenderer
let return_login = document.querySelector('#return_login')

let net = require('net');
let listen_port = 8080
let server = net.createServer((socket) => {
  socket.setEncoding('utf8')
  socket.on('data', (data_str) => {
    let data = JSON.parse(data_str)
    if(data.username != currentUser) {
      socket.write(JSON.stringify({
        code: -1,
        money: 90
      }))
    } else {
      socket.write(JSON.stringify({
        code: 0,
        money: 100
      }))
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