#!/usr/bin/env node
console.log("my test");

var sys = require('util')
var exec = require('child_process').exec;

var request = require("request");
var _ = require("lodash");
var sleep = require('sleep');


function promisedNoWait(cmd){
    return new Promise(function(resolve, reject){
        exec(cmd, function(error, stdout, stderr){
            resolve("success");
            console.log("hello")
            if (error){
                console.log("error")
                reject(error);
            }
            console.log("successlog")
            resolve("success");
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
                console.log("key:"+key+":end");
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
                console.log("key:"+key+":end");
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

var co = require('co');

co (function *(){
    var myIp = yield promisedGetIp();
    console.log('myip: '+myIp);

    var url = "http://prtgapi.ironsrc.com/add_to_rproxy?username=circleci&password=ABFyeJQw6HzappNQ&ip="+myIp;
    var options = {
        method: 'POST',
        url: url,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json'
        }
    };
    var daniel = yield promisedRequest(options);
    console.log(daniel);

    console.log("Clear old adb key")
    var removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
    var removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
    console.log(removeAdbKeyRespond)
    sleep.sleep(10);

    console.log("adb key")
    var addAdbKeyOption = yield promisedExecAddAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
    var addAdbKeyRespond = yield promisedRequest(addAdbKeyOption);
    console.log(addAdbKeyRespond)
    sleep.sleep(10);

    console.log("run ngrok")
    // var runNgrok = yield promisedNoWait("./ngrok http 8888 &")
    exec("./ngrok http 8888 &", function () {})
    // console.log(runNgrok)

    //Need to make Api requests to get available devices from STF

    console.log("adb connect")
    var adbConnect = yield promisedExecPuts("adb connect rproxy-il.ironsrc.com:7409");
    // var adbConnect = yield promisedExecPuts("adb connect stf.ironsrc.com:7409");
    console.log(adbConnect)

    sleep.sleep(10)
    console.log("adb devices")
    var adbDevices = yield promisedExecPuts("adb devices");
    console.log(adbDevices)

    console.log("adb shell")
    var shell_options = { method: 'GET',
        url: 'http://127.0.0.1:4040/api/tunnels',
        headers:
        {'cache-control': 'no-cache' } };
    var shellRespond = yield promisedRequest(shell_options);
    console.log(shellRespond)

    var jsonObject = JSON.parse(shellRespond);
    var arrayFound = _.filter(jsonObject.tunnels, function(val){
        if (val.proto === 'http'){
            return val;
        }
    });
    console.log(arrayFound[0].public_url);
    var new_ip = arrayFound[0].public_url
    // var new_ip = "http://www.walla.co.il"
    var adbOpenBrowser = yield promisedExecPuts("adb shell am start -a android.intent.action.VIEW -d "+new_ip);
    console.log(adbOpenBrowser)

    sleep.sleep(10);
    console.log("Clear old adb key")
    removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
    removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
    console.log(removeAdbKeyRespond)

    process.exit(0)

});


// openIp();
