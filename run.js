#!/usr/bin/env node

var sys = require('util')
var exec = require('child_process').exec;

var request = require("request");
var _ = require("lodash");
var sleep = require('sleep');
var co = require('co');

var fs = require('fs');
var logStream = fs.createWriteStream('log.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
logStream.write('Initial line...'+ '\r\n');



function promisedExec(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, function(error, stdout, stderr){
            if (!error) resolve(cmd)
            reject(error)
        })
    })
}

function promisedExecPuts(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, function(error, stdout, stderr){
            if (stdout){
                resolve(stdout);
            } else if (error) {
                reject(error);
            } else {
                reject(stderr);
            }
        })
    })
}

function promisedRequest(options){
    return new Promise(function(resolve, reject){
        request(options, function(err, res, body){
            if (err) reject(err);
            resolve(body)
        })
    })
}

function promisedGetIp(){
    return new Promise(function(resolve, reject){
        var getIP = require('external-ip')();

        getIP(function (err, ip) {
            if (err) reject(err);
            resolve(ip);
        })
    })
}

function promisedExecAddAdb(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, function(error, stdout, stderr) {
            if (stdout){
                var key = stdout.replace('(stdin)= ','')
                var rand = Math.floor(Math.random() * 100) + 1
                var title = 'adb_key'+rand
                key = key.trim()
                logStream.write("key:"+key+":end"+ '\r\n');
                var options = { method: 'POST',
                    url: 'http://rproxy-il.ironsrc.com:5000/',
                    // url: 'http://stf.ironsrc.com:5000/',
                    headers:
                    { 'cache-control': 'no-cache',
                        'content-type': 'application/json' },
                    body:
                    { action: 'add_adb_key',
                        api_key: '035e04589902445583e2d5355b43eff0dc314dd99582445cbd5dd1038ce1e27f',
                        title: title,
                        adb_key: key },
                    json: true };

                resolve(options)
            } else if (error) {
                reject(error);
            } else {
                reject(stderr);
            }
        });
    })
}

function promisedExecRemoveAdb(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, function(error, stdout, stderr) {
            if (stdout){
                var key = stdout.replace('(stdin)= ','')
                key = key.trim()
                logStream.write("key:"+key+":end"+ '\r\n');
                var options = { method: 'POST',
                    url: 'http://rproxy-il.ironsrc.com:5000/',
                    // url: 'http://stf.ironsrc.com:5000/',
                    headers:
                    { 'cache-control': 'no-cache',
                        'content-type': 'application/json' },
                    body:
                    { action: 'remove_adb_key',
                        api_key: '035e04589902445583e2d5355b43eff0dc314dd99582445cbd5dd1038ce1e27f',
                        adb_key: key },
                    json: true };

                resolve(options)
            } else if (error) {
                reject(error);
            } else {
                reject(stderr);
            }
        });
    })
}

logStream.write("run ngrok"+ '\r\n')
// var runNgrok = yield promisedExec("./ngrok http 8888 &")
exec("./ngrok http 8888 &", function (error, stdout, stderr) {
})
// logStream.write(runNgrok)

co (function *(){
    try {
        var myIp = yield promisedGetIp();
        logStream.write('myip: ' + myIp+ '\r\n');

        var url = "http://prtgapi.ironsrc.com/add_to_rproxy?username=circleci&password=ABFyeJQw6HzappNQ&ip=" + myIp;
        var options = {
            method: 'POST',
            url: url,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json'
            }
        };
        var daniel = yield promisedRequest(options);
        logStream.write(daniel+ '\r\n');

        logStream.write("Clear old adb key"+ '\r\n')
        var removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        var removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
        logStream.write(removeAdbKeyRespond+ '\r\n'.toString())
        sleep.sleep(10);

        logStream.write("adb key"+ '\r\n')
        var addAdbKeyOption = yield promisedExecAddAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        var addAdbKeyRespond = yield promisedRequest(addAdbKeyOption);
        logStream.write(addAdbKeyRespond+ '\r\n'.toString())
        sleep.sleep(10);

        //Need to make Api requests to get available devices from STF

        logStream.write("adb connect"+ '\r\n')
        var adbConnect = yield promisedExecPuts("adb connect rproxy-il.ironsrc.com:7425");
        // var adbConnect = yield promisedExecPuts("adb connect stf.ironsrc.com:7409");
        logStream.write(adbConnect+ '\r\n'.toString())

        sleep.sleep(10)
        logStream.write("adb devices"+ '\r\n')
        var adbDevices = yield promisedExecPuts("adb devices");
        logStream.write(adbDevices+ '\r\n'.toString())

        logStream.write("adb shell"+ '\r\n')
        var shell_options = {
            method: 'GET',
            url: 'http://127.0.0.1:4040/api/tunnels',
            headers: {'cache-control': 'no-cache'}
        };
        var shellRespond = yield promisedRequest(shell_options);
        logStream.write(shellRespond+ '\r\n'.toString())

        var jsonObject = JSON.parse(shellRespond);
        var arrayFound = _.filter(jsonObject.tunnels, function (val) {
            if (val.proto === 'http') {
                return val;
            }
        });
        logStream.write(arrayFound[0].public_url+ '\r\n'.toString());
        var new_ip = arrayFound[0].public_url
        // var new_ip = "http://www.walla.co.il"
        var adbOpenBrowser = yield promisedExecPuts("adb shell am start -a android.intent.action.VIEW -d " + new_ip);
        logStream.write(adbOpenBrowser+ '\r\n'.toString())

        sleep.sleep(5);
        logStream.write("Clear old adb key"+ '\r\n')
        removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
        logStream.write(removeAdbKeyRespond+ '\r\n'.toString())

        sleep.sleep(20)
        process.exit(0)
        logStream.end('this is the end line');
    }catch (err){
            logStream.write(err.stack+ '\r\n'.toString())
        }

}).catch(function(err) {
    logStream.write(err.stack);
});
