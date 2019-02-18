const { exec, execSync } = require('child_process')
 fs = require("fs"),
    os = require("os");

module.exports = {
    os: detectOS,
    browsers: detectBrowsers
};

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

    const FirefoxRegex = /DisplayName[\r\t\f\v |A-Z|_]+Mozilla Firefox/;
    const ChromeRegex = /DisplayName[\r\t\f\v |A-Z|_]+Chrome/;
    // Note: Node by default opens a CMD shell, not a powershell.
    let win32Install = execSync("reg query HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall /s /v DisplayName").toString();
    let win64Install = execSync("reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall /s /v DisplayName").toString();
        

    if (win32Install.search(FirefoxRegex) || win64Install.search(FirefoxRegex)){
        browsers.firefox = true;
    }
    if (win32Install.search(ChromeRegex) || win64Install.search(ChromeRegex)){
        browsers.chrome = true;
    }
    console.log(browsers);
    if (!(browsers.firefox || browsers.chrome)) {
        console.error("Error: No compatible browsers detected. Please install Google Chrome.");
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
    });  
}