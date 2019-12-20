// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const log4js = require('log4js')
const date = new Date().getTime()
const log_path = './static/log/' + date + '.log'
log4js.configure({
  appenders: { bank: { type: 'file', filename: log_path } },
  categories: { default: { appenders: ['bank'], level: 'info' } }
})
const logger = log4js.getLogger('bank')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  Menu.setApplicationMenu(null)
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

  logger.info('启动登陆页')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

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
  logger.info('退出程序')
  app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

let currentUser = ''

ipcMain.on('login', (event, arg) => {
  currentUser = arg
  logger.info('用户以 ' + currentUser + ' 身份登陆')
  if(currentUser === 'admin') {
    mainWindow.loadFile('admin.html')
  } else {
    mainWindow.loadFile('user.html')
  }
})

ipcMain.on('return_login', (event, arg) => {
  logger.info('用户 ' + currentUser + ' 退出登陆')
  mainWindow.loadFile('index.html')
  currentUser = ''
})

ipcMain.on('getUser', (event) => {
  event.returnValue = currentUser
})

ipcMain.on('get_log_path', (event) => {
  event.returnValue = log_path
})