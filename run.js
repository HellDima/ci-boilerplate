#!/usr/bin/env node

'use strict';

var sys = require('util')
var exec = require('child_process').exec;

var request = require("request");
var _ = require("lodash");
var sleep = require('sleep');
var sleepCo = require('co-sleep');
var co = require('co');
var Promise = require("bluebird");

var fs = require('fs');
var logStream = fs.createWriteStream('log.txt', {'flags': 'a'});
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
console.log('Initial line...'+ '\r\n');


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

function promisedRequestTakeOwner(devices, filter){
    return new Promise(function(resolve, reject){
        var options2
        var myFilter = {}
        if (filter) {
            myFilter[filter.split(":")[0]]=filter.split(":")[1]
            options2 = {
                method: 'POST',
                // url: 'http://stf.ironsrc.com:5000/',
                url: 'http://rproxy-il.ironsrc.com:5000/',
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                body: {
                    action: 'take_owner',
                    api_key: '035e04589902445583e2d5355b43eff0dc314dd99582445cbd5dd1038ce1e27f',
                    devices_required: devices,
                    filter: myFilter
                },
                json: true
            };
        }else {
            options2 = {
                method: 'POST',
                // url: 'http://stf.ironsrc.com:5000/',
                url: 'http://rproxy-il.ironsrc.com:5000/',
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                body: {
                    action: 'take_owner',
                    api_key: '035e04589902445583e2d5355b43eff0dc314dd99582445cbd5dd1038ce1e27f',
                    devices_required: devices
                },
                json: true
            };
        }

        request(options2, function(err, res, body){
            if (err) reject(err);
            resolve(body)
        })
    })
}

function promisedRequestReleaseOwner(){
    return new Promise(function(resolve, reject){
        var options2 = { method: 'POST',
            // url: 'http://stf.ironsrc.com:5000/',
            url: 'http://rproxy-il.ironsrc.com:5000/',
            headers:
            { 'cache-control': 'no-cache',
                'content-type': 'application/json' },
            body:
            { action: 'release_owner',
                api_key: '035e04589902445583e2d5355b43eff0dc314dd99582445cbd5dd1038ce1e27f',
                all: 'true' },
            json: true };

        request(options2, function(err, res, body){
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
                console.log("key:"+key+":end"+ '\r\n');
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
                console.log("key:"+key+":end"+ '\r\n');
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


var argv = require('optimist').argv;
var devices_required = 1
var filter = ""

if (argv.d)
    devices_required = argv.d
if (argv.f)
    filter = argv.f

console.log("Will run on "+ devices_required+" devices"+ '\r\n')
console.log("Will run with filter: "+ filter+ '\r\n')

console.log("run ngrok"+ '\r\n')
exec("./ngrok http 8888 &", function (error, stdout, stderr) {
})



co (function *(){
    try {
        var myIp = yield promisedGetIp();
        console.log('myip: ' + myIp+ '\r\n');

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
        console.log(daniel+ '\r\n');

        console.log("Clear old adb key"+ '\r\n')
        var removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        var removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
        console.log(removeAdbKeyRespond+ '\r\n'.toString())
        sleep.sleep(10);

        console.log("adb key"+ '\r\n')
        var addAdbKeyOption = yield promisedExecAddAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        var addAdbKeyRespond = yield promisedRequest(addAdbKeyOption);
        console.log(addAdbKeyRespond+ '\r\n'.toString())
        sleep.sleep(10);

        var owned_devices = yield promisedRequestTakeOwner(devices_required, filter)
        console.log(owned_devices)

        console.log("adb shell"+ '\r\n')
        var shell_options = {
            method: 'GET',
            url: 'http://127.0.0.1:4040/api/tunnels',
            headers: {'cache-control': 'no-cache'}
        };
        var shellRespond = yield promisedRequest(shell_options);
        console.log(shellRespond+ '\r\n'.toString())

        var jsonObject = JSON.parse(shellRespond);
        var arrayFound = _.filter(jsonObject.tunnels, function (val) {
            if (val.proto === 'http') {
                return val;
            }
        });
        console.log(arrayFound[0].public_url+ '\r\n'.toString());
        var new_ip = arrayFound[0].public_url
        // var new_ip = "http://www.walla.co.il"

        var disconnect = yield promisedExecPuts("adb disconnect")
        console.log(disconnect)

        yield Promise.each(owned_devices, co.wrap(function *(item) {
            console.log("foreach run item: "+ item['adb_url'])
            sleep.sleep(2)
            if (item['success']){
                console.log("success: "+ item['adb_url'])
                var adb_url = item['adb_url'].replace("stf.ironsrc.com", "rproxy-il.ironsrc.com")
                console.log("adb connect1111")
                var adbConnect = yield promisedExecPuts("adb connect "+adb_url);
                console.log(adbConnect)
                yield sleepCo(5000)

                var adbDevices = yield promisedExecPuts("adb devices");
                console.log(adbDevices+ '\r\n'.toString())

                // sleep.sleep(5);
                yield sleepCo(5000)
                console.log("adb shell")
                var adbOpenBrowser = yield promisedExecPuts("adb shell am start -a android.intent.action.VIEW -d " + new_ip);
                console.log(adbOpenBrowser+ '\r\n'.toString())
                // sleep.sleep(5);
                yield sleepCo(10000)
                console.log("adb disconnect")
                var disconnect = yield promisedExecPuts("adb disconnect")
                console.log(disconnect)
                // sleep.sleep(5);
                yield sleepCo(5000)
            }
        }));
        console.log("adb devices"+ '\r\n')
        var adbDevices = yield promisedExecPuts("adb devices");
        console.log(adbDevices+ '\r\n'.toString())

        sleep.sleep(5);
        console.log("Clear old adb key"+ '\r\n')
        removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
        console.log(removeAdbKeyRespond+ '\r\n'.toString())

        sleep.sleep(20)

        var releaseown = yield promisedRequestReleaseOwner()
        console.log(releaseown.toString())
        process.on('uncaughtException', function (err) {
            console.log(err+ '\r\n'.toString());
        });
        process.exit(0)
        logStream.end('this is the end line');
    }catch (err){
        console.log(err.stack+ '\r\n'.toString())
        logStream.end('this is the end line');
    }

}).catch(function(err) {
    console.log("catch error");
    console.log(err.stack);
    logStream.end('this is the end line');
});

console.log("start second co")



