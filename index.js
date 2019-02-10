
const { exec } = require('child_process'),
    fs = require("fs"),
    detect = require("./detect")

function main() {
    const platform = detect.os(),
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
    }, 350);
}

function windowsStart(config) {
    detect.browsers(false).then(browsers =>{
        if (browsers.chrome) {
            startChromeWindows(config);
        } else if (browsers.firefox) {
            startFireFox(config, true);
        }
    });
}
function unixStart(config) {
    detect.browsers(true).then( browsers =>{
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

main();