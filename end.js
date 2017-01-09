#!/usr/bin/env node

'use strict';
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
logStream.write('Initial line...'+ '\r\n');


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
                // api_key: 'd91c22237f234ec6ba0295e76476ce77bacd1ee11d3d4928a019b9c69f32cf16',
                api_key: apiKey,
                all: 'true' },
            json: true };

        request(options2, function(err, res, body){
            if (err) reject(err);
            resolve(body)
        })
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
                        // api_key: 'd91c22237f234ec6ba0295e76476ce77bacd1ee11d3d4928a019b9c69f32cf16',
                        api_key: apiKey,
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
var apiKey = ""

if (argv.d)
    devices_required = argv.d
if (argv.f)
    filter = argv.f
if (argv.k)
    apiKey = argv.k

logStream.write("Will run with apiKey: "+ apiKey+ '\r\n')
logStream.write("Starting End part, closing all \r\n")



co (function *(){
    try {
        var disconnect = yield promisedExecPuts("adb disconnect")
        logStream.write(disconnect+ '\r\n'.toString())
        sleep.sleep(5);

        console.log("adb devices"+ '\r\n')
        var adbDevices = yield promisedExecPuts("adb devices");
        logStream.write(adbDevices+ '\r\n'.toString())

        sleep.sleep(5);
        logStream.write("Clear old adb key"+ '\r\n')
        var removeAdbKeyOption = yield promisedExecRemoveAdb("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c");
        var removeAdbKeyRespond = yield promisedRequest(removeAdbKeyOption);
        console.log(removeAdbKeyRespond+ '\r\n'.toString())

        sleep.sleep(5)

        var releaseown = yield promisedRequestReleaseOwner()
        logStream.write(releaseown+ '\r\n'.toString())
        process.on('uncaughtException', function (err) {
            logStream.write(err+ '\r\n'.toString());
        });
        logStream.end('this is the end line');
        process.exit(0)
    }catch (err){
        logStream.write(err.stack+ '\r\n'.toString())
        logStream.end('this is the end line');
        process.exit(0)
    }

}).catch(function(err) {
    logStream.write("catch error");
    logStream.write(err.stack);
    logStream.end('this is the end line');
    process.exit(0)
});




