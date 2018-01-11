const electron = require('electron')
const {
    app,
    BrowserWindow,
    Menu,
    session
} = electron
const settings = require('./settings-manager')
const eSettings = require('electron-settings')
const path = require('path')
const async = require('async')
const express = require('express')
const ChildProcess = require('child_process')
const bodyParser = require('body-parser')
const _ = require('underscore')

var expressApp, bankExpressApp, bankServer;

var win, settingsWin;

const debug = /--debug/.test(process.argv[2])

var captchaBank = [];

// Launch Menu Spawn System

var createShortcut = function(callback) {
    spawnUpdate([
        '--createShortcut',
        path.basename(process.execPath),
        '--shortcut-locations',
        'StartMenu'
    ], callback)
}

var removeShortcut = function(callback) {
    spawnUpdate([
        '--removeShortcut',
        path.basename(process.execPath)
    ], callback)
}

var spawnUpdate = function(args, callback) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe')
    var stdout = ''
    var spawned = null

    try {
        spawned = ChildProcess.spawn(updateExe, args)
    } catch (error) {
        if (error && error.stdout == null)
            error.stdout = stdout
        process.nextTick(function() {
            callback(error)
        })
        return
    }

    var error = null

    spawned.stdout.on('data', function(data) {
        stdout += data
    })

    spawned.on('error', function(processError) {
        if (!error)
            error = processError
    })

    spawned.on('close', function(code, signal) {
        if (!error && code !== 0) {
            error = new Error('Command failed: ' + code + ' ' + signal)
        }
        if (error && error.code == null)
            error.code = code
        if (error && error.stdout == null)
            error.stdout = stdout
        callback(error)
    })
}

process.on('uncaughtException', function (error) {
    console.log(error);
});

switch (process.argv[1]) {
    case '--squirrel-install':
        createShortcut(function() {
            app.quit()
        });
        break;
    case '--squirrel-uninstall':
        removeShortcut(function() {
            app.quit();
        });
        break;
    case '--squirrel-obsolete':
    case '--squirrel-updated':
        app.quit();
        break;
    default:
        init();
}

function init() {
    app.on('ready', () => {

        settings.init()
        app.ch = {
            settings
        }

        win = new BrowserWindow({
            width: 650,
            height: 650,
            minWidth: 650,
            minHeight: 650,
            resizable: true,
            maxWidth: 650,
            maxHeight: 650,
            fullscreenable: false,
            frame: true,
            show: true
            //icon: `${__dirname}/static/icon.png`
        })


        const menuTemplate = [{
                label: 'File',
                submenu: [{
                        label: 'Settings',
                        click() {
                            initSettings()
                        },
                        accelerator: 'CmdOrCtrl+,',
                    },
                    {
                        label: 'Quit',
                        click() {
                            app.quit()
                        },
                        accelerator: 'CmdOrCtrl+Q',
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [{
                        role: 'copy'
                    },
                    {
                        role: 'paste'
                    },
                    {
                        role: 'pasteandmatchstyle'
                    },
                    {
                        role: 'delete'
                    },
                    {
                        role: 'selectall'
                    }
                ]
            },
            {
                label: 'View',
                submenu: [{
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    }
                }]
            },
            {
                role: 'window',
                submenu: [{
                        role: 'minimize'
                    },
                    {
                        role: 'close'
                    }
                ]
            },
            {
                role: 'help',
                submenu: [{
                        label: 'Learn More about CaptchaHarvester',
                        click() {
                            require('electron').shell.openExternal('github.com/dzt/captcha-harvester')
                        }
                    },
                    {
                        label: 'Toggle Developer Tools',
                        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                        click(item, focusedWindow) {
                            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                        }
                    }
                ]
            }
        ]

        // If the platform is Mac OS, make some changes to the window management portion of the menu
        if (process.platform === 'darwin') {
            menuTemplate[2].submenu = [{
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Zoom',
                    role: 'zoom'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Bring All to Front',
                    role: 'front'
                }
            ]
        }

        // Set menu template just created as the application menu
        const mainMenu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(mainMenu)
        win.setMenu(null);
        //win.webContents.openDevTools()
        win.loadURL(`file://${__dirname}/index.html`);

    })
}

electron.ipcMain.on('openCapWindow', function(event, args) {
    initCapWindow();
});

const moment = require('moment');

electron.ipcMain.on('sendCaptcha', function(event, token) {

  captchaBank.push({
    token: token,
    timestamp: moment(),
    host: eSettings.getSync('host'),
    sitekey: eSettings.getSync('sitekey')
  })

  win.webContents.send('addHistory', {
    token: token,
    timestamp: moment(),
    host: eSettings.getSync('host'),
    sitekey: eSettings.getSync('sitekey')
  });

});

// Every 1 second check for expired tokens and remove them
setInterval(function(){
  for (var i = 0; i < captchaBank.length; i++) {

    win.webContents.send('updateHistory', { time: 110 - moment().diff(moment(captchaBank[i].timestamp), 'seconds'), token: captchaBank[i].token });

    if (moment().diff(moment(captchaBank[i].timestamp), 'seconds') > 110) {
      console.log('Removing Captcha Token')
      win.webContents.send('markExpired', captchaBank[i]);
      captchaBank = _.reject(captchaBank, function(el) {
        return el.token === captchaBank[i].token;
      });
      console.log(captchaBank)
    }
  }
}, 1000);

electron.ipcMain.on('resetApp', (event, args) => {
    win.close()
    settingsWin.close()
    app.quit();
})

electron.ipcMain.on('refreshMainWindow', (event, args) => {
    win.webContents.send('refreshMain');
})

electron.ipcMain.on('restartServer', (event, args) => {
    bankServer.close()
    bankExpressApp = null
    initBankServer();
})

electron.ipcMain.on('login', (event, args) => {

  const loginWindow = new BrowserWindow({
    width: 600,
    height: 600,
    minWidth: 600,
    minHeight: 600
  });


  loginWindow.setMenu(null);
  loginWindow.loadURL('https://accounts.google.com/signin/v2/identifier?hl=en&service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Ffeature%3Dsign_in_button%26hl%3Den%26app%3Ddesktop%26next%3D%252F%26action_handle_signin%3Dtrue&passive=true&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin');

})

electron.ipcMain.on('logout', function(event) {
    session.defaultSession.clearStorageData([]);
    session.defaultSession.clearCache();
})

function initBankServer() {
  bankExpressApp = express()

  let port = parseInt(eSettings.getSync('server_port'));

  console.log('Bank server listening on port: ' + port);
  bankExpressApp.set('port', port);
  bankExpressApp.use(bodyParser.json());
  bankExpressApp.use(bodyParser.urlencoded({ extended: true }));

  bankExpressApp.get('/', function(req, res) {
    return res.json(captchaBank);
  });

  bankExpressApp.get('/trigger', function(req, res) {
    initCapWindow();
  });

  bankServer = bankExpressApp.listen(bankExpressApp.get('port'));

}

initBankServer();

function initCapWindow() {

    expressApp = express()
    expressApp.set('port', parseInt(eSettings.getSync('port')));
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({ extended: true }));

    expressApp.get('/', function(req, res) {
        res.sendFile('./captcha.html', {root: __dirname});
        capWin.webContents.session.setProxy({proxyRules:""}, function () {});
    })

    var server = expressApp.listen(expressApp.get('port'));

    win.webContents.session.setProxy({
      proxyRules: `http://127.0.0.1:${parseInt(eSettings.getSync('port'))}`
    }, function (r) {
        capWin.loadURL(eSettings.getSync('host'));
    });

    capWin = new electron.BrowserWindow({
        backgroundColor: '#ffffff',
        center: true,
        fullscreen: false,
        height: 450,
        //icon: `${__dirname}/static/icon.png`,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false,
        skipTaskbar: true,
        title: 'CaptchaHarvester',
        useContentSize: true,
        width: 450
    })

    // No menu on the About settingsWindow
    capWin.setMenu(null);
    //capWin.webContents.openDevTools()
    capWin.once('ready-to-show', function() {
        capWin.show()
    })

    capWin.once('closed', function() {
        capWin = null
        server.close();
    })

    return capWin.show()
}
