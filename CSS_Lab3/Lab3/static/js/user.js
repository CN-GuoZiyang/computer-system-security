let ipcRenderer = require('electron').ipcRenderer
let net = require('net')
let admin_port = 8080
let admin_host = '127.0.0.1'

let username = ''
let currency = document.querySelector('#currency')

let return_login = document.querySelector('#return_login')
return_login.addEventListener('click', (e) => {
    ipcRenderer.send('return_login')
})

ipcRenderer.on('username', (event, arg) => {
    username = arg
    document.querySelector('#username').innerHTML = username
})

ipcRenderer.send('getUser');

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
    if(typeof money == 'undefined' || money == null || money == '' || !/^[0-9]*$/.test(money) || parseFloat(money) <= 0) {
        window.alert('输入不合法！')
        return
    }
    
    let client= new net.Socket();
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
        if(result.code != 0) {
            window.alert('操作失败！' + result.msg)
        }
        deposit_dialog.close()
        currency.innerHTML = result.money
    })

    client.on('error', (error) => {
        window.alert('操作失败！' + error)
        client.destroy()
        deposit_dialog.close()
        return
    })

    client.on('close', () => {})
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
    if(typeof money == 'undefined' || money == null || money == '' || !/^[0-9]*$/.test(money) || parseFloat(money) <= 0) {
        window.alert('输入不合法！')
        return
    }
    
    let client= new net.Socket();
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
        if(result.code != 0) {
            window.alert('操作失败！' + result.msg)
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
    client.on('close',() => {});
})