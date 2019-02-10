
const { exec } = require('child_process'),
    fs = require("fs"),
    os = require("os");

main();

function detectOS() { return os.platform() != "win32" }
function detectBrowsers(os) {
    return new Promise((resolve, reject) => {
        const browsers = {};
        console.log("detect browsers")
        if (os) {
            detectUnixBrowsers(browsers).then((browsers) => resolve(browsers));
        } else {    
            resolve(detectWindowsBrowsers(browsers));
        }
    })
    
}

function detectWindowsBrowsers(browsers) {
    const username = os.userInfo().username;

    if (fs.existsSync("c:/Users/"+username+"/AppData/Local/Google/chrome")) {
        browsers.chrome = true;
    } else if (fs.existsSync("c:/Program Files/Mozilla Firefox")) {
        browsers.firefox = true;
    } else {
        console.error("Error: Please install google chrome.");
    }
    return browsers;
}

function detectUnixBrowsers(browsers, callback){
    return new Promise((resolve, reject) => {
        exec("which google-chrome", (err, stdout, stderr) => {
            if (err) { return; }
            if (stdout.indexOf("/google-chrome") > -1) {
                browsers.chrome = true;
            } else {
                return new Promise((resolve, reject) =>{
                    exec("which chromium", (err, stdout, stderr) => {
                        if (err) { return; }
                        if (stdout.indexOf("/chromium") > -1) {
                            browsers.chromium = true;   
                        } else {
                            return new Promise((resolve, reject) =>{
                                exec("which firefox", (err, stdout, stderr) => {
                                    if (err) { return; }
                                    if (stdout.indexOf("/firefox") > -1) {
                                        browsers.firefox = true;   
                                    } else {
                                        console.error("Error: Please install google chrome.");
                                    }
                                    resolve(browsers);
                                });
                            });
                        }
                        resolve(browsers);
                    });
                });
            }
            resolve(browsers);
        });
    })
    
}

function windowsStart(config) {
    detectBrowsers(false).then(browsers =>{
        if (browsers.chrome) {
            startChromeWindows(config);
        } else if (browsers.firefox) {
            startFireFox(config, true);
        }
    });
}
function unixStart(config) {
    detectBrowsers(true).then( browsers =>{
        if (browsers.chrome) {
            startChromeUnix(config);
        }  else if (browsers.chromium) {
            startChromiumUnix(config);
        } else if (browsers.firefox) {
            startFireFox(config);
        }
    });
}

function startFireFox(config, win32) {
    console.log("start firefox")
    let command = `firefox -url 'data:text/html;charset=utf-8,<!DOCTYPE html><html><body><script>`+
    `window.open("http://localhost:${config.port}", "_blank","height=400,width=600,menubar=no,location=no,toolbar=no,left=100,top=100")`+
    `<%2Fscript><%2Fbody><%2Fhtml>'`;

    if (win32) {
        command = "start "+command;
    }
    console.log(command)
    exec(command, (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromeWindows(config) {
    exec("start chrome --app=http://localhost:"+config.port, (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromiumUnix(config) {
    exec("chromium --app=http://localhost:"+config.port+"/app/index.htm", (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromeUnix(config) {
    exec("google-chrome --app=http://localhost:"+config.port+"/app/index.htm", (err, stdout, stderr) => {
        if (err) { return; }
    });
}


function main() {
    const platform = detectOS(),
        config = JSON.parse(fs.readFileSync("./nucleus.json"));

    exec(platform ? "./nucleus" : "start nucleus.exe", (err, stdout, stderr) => {
        if (err) { return; }
    });
    setTimeout(()=>{
        if (platform) {
            unixStart(config);
        } else {
            windowsStart(config);
        }
    }, 250)
}

