
const { exec } = require('child_process'),
    fs = require("fs"),
    os = require("os");

function detectOS() { return os.platform() != "win32" }
function detectWindowsBrowsers() {
    const username = os.userInfo().username,
        browsers = {};
   
    if (fs.existsSync("c:/Users/"+username+"/AppData/Local/Google/chrome")) {
        browsers.chrome = true;
    }
    return browsers;
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
 
function windowsStart(path) {
    const browsers = detectWindowsBrowsers();

    if (browsers.chrome) {
        startChromeWindows(path);
    } else {
        console.error("Error: Please install google chrome.");
    }
}
function unixStart(path) {}
function startChromeWindows(path) {
    const appRoot = path.replace(/\\/g, "/").replace(/\s/g, "").replace(/\n/g, "")+"/app/index.htm";
    
    exec("start chrome --app="+appRoot, (err, stdout, stderr) => {
        if (err) { return; }
    });
}
