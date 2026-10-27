const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // 创建浏览器窗口
    let win = new BrowserWindow({
        width: 850,
        height: 600,
        resizable: true,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            preload: path.join(__dirname, './preload.js'),
            contextIsolation: true
        }
    });

    // 开发模式
    if (process.env.NODE_ENV == 'development') {
        win.loadURL('http://localhost:3000/');
    }

    // 生产模式
    else {
        win.loadFile('./dist/index.html');
    }

    return win;

}

let win;
app.whenReady().then(() => {

    // 创建主界面
    win = createWindow();

    // 监听来自主界面的请求
    require('./nodejs/ipcMain.on.js')(win);
    require('./nodejs/api.on.js')(win);

    setTimeout(() => {

        // 提示渲染页面，初始化完成了
        win.webContents.send("ready");

    }, 500);
});

app.on('window-all-closed', () => {
    // 点击关闭按钮，直接退出
    app.quit();
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
