let ipcRenderer = require('electron').ipcRenderer

let dialog = document.querySelector('dialog')
let username = document.querySelector('#username')
let password = document.querySelector('#password')
let userLogin = document.querySelector('#userLogin')

userLogin.addEventListener('click', () => {
    dialog.showModal()
    dialog.querySelector('#close_dialog').addEventListener('click', () => {
        dialog.close()
        username.value = ''
        password.value = ''
    })
    dialog.querySelector('#confirm_dialog').addEventListener('click', () => {
        dialog.close()
        if(username.value != password.value) {
            document.querySelector('#common_error_msg_noreturn').innerHTML = '用户名或密码错误！'
            document.querySelector('#common_error_dialog_noreturn').showModal()
        } else {
            returnValue = ipcRenderer.sendSync('login', username.value)
            if(returnValue == -1) {
                dialog.close()
                document.querySelector('#common_error_msg_noreturn').innerHTML = '登陆错误：未知错误！'
                document.querySelector('#common_error_dialog_noreturn').showModal()
            } else if(returnValue == -2) {
                dialog.close()
                document.querySelector('#common_error_msg_noreturn').innerHTML = '登陆错误：无此用户！'
                document.querySelector('#common_error_dialog_noreturn').showModal()
            } else {
                dialog.close()
            }
        }
    })
})

let common_error_noreturn = document.querySelector('#common_error_noreturn')
common_error_noreturn.addEventListener('click', (e) => {
  document.querySelector('#common_error_dialog_noreturn').close()
})