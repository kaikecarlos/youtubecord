
var {BrowserWindow, app} = require('electron');

const {Client} = require('discord-rpc');
const rpc      = new Client({transport: 'ipc'})

let appID = '422113307038580751',
    mainWindow,
    smallImageKey,
    start, end,
    WindowSettings = {
        backgroundColor: '#FFF',
        useContentSize: false,
        autoHideMenuBar: true,
        resizable: true,
        center: true,
        frame: true,
        alwaysOnTop: false,
        title: 'Youtube',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    },
    login = (tries = 0) => {
        if (tries > 10) return mainWindow.webContents.executeJavaScript(connectionNotice);
        tries += 1;
        rpc.login(appID).catch(e => setTimeout(() => login(tries), 10E3));
    },
    getInfos = `(function() {
        let [type, id] = window.location.pathname.split('/').slice(1, 3);
        if (type != 'watch') {
            return {
                name: 'Browsing',
                title: 'Searching a nice video',
            }
        }
        if (type =='watch') {
            return {
                name: document.querySelector('.title.ytd-video-primary-info-renderer') ? document.querySelector('.title.ytd-video-primary-info-renderer').innerText : document.innerText,
                title: document.querySelector('#owner-name.ytd-video-owner-renderer') ? document.querySelector('#owner-name.ytd-video-owner-renderer').innerText : document.innerText,
            }
        }
    })()`,
     connectionNotice = `let notice = document.createElement('div'),
        close_btn = document.createElement('span');
        notice.className = 'error-notice';
        notice.setAttribute('style', 'position: fixed; top: 0px; background: #ef5858; border-bottom: 3px solid #e61616; border-radius: 3px; z-index: 101; color: white; width: 99%; line-height: 2em; text-align: center; margin: 0.5%;');
        close_btn.className = 'close-btn';
        close_btn.innerHTML = '&times;';
        close_btn.setAttribute('style', 'float: right; margin-right: 0.5%; font-size: 20px;');
        notice.innerHTML = 'Failed to connect to Discord IRC. Connection timed out.';
        notice.appendChild(close_btn);
        document.body.appendChild(notice);
        notice.onclick = () => document.body.removeChild(notice);
        setTimeout(() => document.body.removeChild(notice), 15E3);`;


    async function checkYoutube() {
        if (!mainWindow) return;

        let infos = await mainWindow.webContents.executeJavaScript(getInfos);
        if (infos) {
            let {name, title} = infos,
                video = name && title
                curr = parseInt(new Date().getTime().toString().slice(0, 10));

            if (title === "rezendeevil") {
               smallImageKey = 'rezendeevil';
            }else if(title === "AssopraFitas") {
                smallImageKey = 'assoprafitas';
            } else {
                smallImageKey = 'play';
            }
            rpc.setActivity({
                details: name,
                state: video,
                largeImageKey: 'youtube',
                smallImageKey,
                instace: false,
            });
            
        }
    }

    rpc.on('ready', () => {
        checkYoutube();
        setInterval(() => {
            checkYoutube();
        }, 15E3);
    })
    app.on('ready', () => {
        mainWindow = new BrowserWindow(WindowSettings);
        mainWindow.maximize();
        mainWindow.loadURL("https://www.youtube.com/");
        login();
    });

    app.on('window-all-closed', app.quit);
app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});
