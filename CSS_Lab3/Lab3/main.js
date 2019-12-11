// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

let currentUser = ''

ipcMain.on('login', (event, arg) => {
  currentUser = arg
  if(currentUser === 'admin') {
    mainWindow.loadFile('admin.html')
  } else {
    mainWindow.loadFile('user.html')
  }
})

ipcMain.on('return_login', (event, arg) => {
  mainWindow.loadFile('index.html')
  currentUser = ''
})

ipcMain.on('getUser', (event) => {
  event.sender.send('username', currentUser)
})

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