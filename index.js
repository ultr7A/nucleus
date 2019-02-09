
const { exec } = require('child_process'),
    fs = require("fs"),
    os = require("os");

function detectOS() { return os.platform() != "win32" }
function detectBrowsers(os) {
    return new Promise((resolve, reject) => {
        const browsers = {};

        if (os) {
            return detectUnixBrowsers(browsers).then((browsers) => browsers);
        } else {    
            return detectWindowsBrowsers(browsers);
        }
    })
    
}

function detectWindowsBrowsers(browsers) {
    const username = os.userInfo().username;

    if (fs.existsSync("c:/Users/"+username+"/AppData/Local/Google/chrome")) {
        browsers.chrome = true;
    } else {
        console.error("Error: Please install google chrome.");
    }
    return browsers;
}

function detectUnixBrowsers(browsers, callback){
    return new Promise((resolve, reject) => {
        exec("which google-chrome", (err, stdout, stderr) => {
            if (err) { return; }
            if (stdout.indexOf("/google-chrome") == > -1) {
                browsers.chrome = true;
            } else {
                return new Promise((resolve, reject) =>{
                    exec("which chromium", (err, stdout, stderr) => {
                        if (err) { return; }
                        if (stdout.indexOf("/chromium") > -1) {
                            browsers.chromium = true;   
                        } else {
                            console.error("Error: Please install google chrome.");
                        }
                        resolve(browsers);
                    });
                });
            }
            // check for firefox
            resolve(browsers);
        });
    })
    
}

function windowsStart(path) {
    const browsers = detectBrowsers(false);

    console.log("get browsers for windows")
    if (browsers.chrome) {
        console.log("start chrome windows")
        startChromeWindows(path);
    }
}
function unixStart(path) {
    detectBrowsers(true).then( browsers =>{
        if (browsers.chrome) {
            startChromeUnix(path);
        }  else if (browsers.chromium) {
            startChromiumUnix(path);
        }
    });
}

function startFireFox(path) {
    exec(`firefox -url 'data:text/html;charset=utf-8,<!DOCTYPE html><html><body><script>`+
        `window.open("`+path+"/app/index.htm"+`", "_blank","height=400,width=600,menubar=no,location=no,toolbar=no,left=100,top=100")`+
        `<%2Fscript><%2Fbody><%2Fhtml>'`, (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromeWindows(path) {
    const appRoot = path.replace(/\\/g, "/").replace(/\s/g, "").replace(/\n/g, "")+"/app/index.htm";
    
    exec("start chrome --app="+appRoot, (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromiumUnix(path) {
    exec("chromium --app="+path+"/app/index.htm", (err, stdout, stderr) => {
        if (err) { return; }
    });
}
function startChromeUnix(path) {
    exec("google-chrome --app="+path+"/app/index.htm", (err, stdout, stderr) => {
        if (err) { return; }
    });
}


exec("pwd", (err, stdout, stderr) => {
    if (err) { return; }
    const wd = stdout,
        platform = detectOS();

    if (platform) {
        unixStart(wd);
    } else {
        windowsStart(wd);
    }
});

