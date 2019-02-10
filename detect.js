const fs = require("fs"),
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
    });  
}