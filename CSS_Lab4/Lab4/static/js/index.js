let ipcRenderer = require('electron').ipcRenderer;

let dialog = document.querySelector('dialog');
let username = document.querySelector('#username');
let userLogin = document.querySelector('#userLogin');
let adminLogin = document.querySelector("#adminLogin")

userLogin.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('#close_dialog').addEventListener('click', () => {
        dialog.close();
        username.value = '';
    });
    dialog.querySelector('#confirm_dialog').addEventListener('click', () => {
        dialog.close();
        ipcRenderer.send('login', username.value)
    });
});

adminLogin.addEventListener('click', () => {
    ipcRenderer.send('login', 'admin')
});