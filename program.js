const electron = require('electron')
const {app, BrowserWindow} = electron

app.on('ready', () => {
    let win = new BrowserWindow({widht:800, height:600, resizable: false, useContentSize: true});
    win.loadURL(`file://${__dirname}/index.html`);
});
