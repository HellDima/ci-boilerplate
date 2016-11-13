#!/usr/bin/env node
console.log("my test");
console.log("this is working");

var sys = require('util')
var exec = require('child_process').exec;

var request = require("request");

// GET request

function openIp(){
    // exec("npm install request", puts);
    // exec("npm install external-ip", puts);
    'use strict';

    var getIP = require('external-ip')();

    getIP(function (err, ip) {
        if (err) {
            // every service in the list has failed
            throw err;
        }
        console.log(ip);

        var url = "http://prtgapi.ironsrc.com/add_to_rproxy?username=circleci&password=ABFyeJQw6HzappNQ&ip="+ip
        console.log("Open ip: "+url);
        var options = { method: 'POST',
            url: url,
            headers:
            { 'cache-control': 'no-cache',
                'content-type': 'application/json' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            // console.log(body);

            // exec("ping -c 3 rproxy-il.ironsrc.com", puts);


            setTimeout(function () {
                console.log("adb key")
                exec("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c", putsAdbAdd);
            }, 5000)


            setTimeout(function () {
                console.log("adb connect")
                exec("adb connect rproxy-il.ironsrc.com:7433", puts);
                // exec("adb connect stf.ironsrc.com:7433", puts);
            }, 25000)
            // exec("adb connect rproxy-il.ironsrc.com:7485", puts);
            // exec("adb connect stf.ironsrc.com:7433", puts);

            // setTimeout(function () {
            //     console.log("adb devices")
            //     exec("adb devices", puts);
            //     // exec("adb shell am start -a android.intent.action.VIEW -d http://www.walla.co.il", puts);
            // }, 20000)

            setTimeout(function () {
                console.log("adb shell")
                // exec("adb devices", puts);
                exec("adb shell am start -a android.intent.action.VIEW -d http://"+ip+":8888", puts);
            }, 45000)
            // return(body);

            setTimeout(function () {
                console.log("adb key")
                exec("awk '{print $1}' < ~/.android/adbkey.pub | openssl base64 -A -d -a | openssl md5 -c", putsAdbRemove);
            }, 65000)
        });
    });



}
function puts(error, stdout, stderr) {
    if (stdout){
        console.log("stdout:"+stdout);
    } else if (error) {
        console.log("error:"+error);
    } else {
        console.log("stderr:"+stderr);
    }
}

function putsAdbAdd(error, stdout, stderr) {
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
            { action: 'add_adb_key',
                api_key: 'e9addbf55ab34ba8bd3cebe67dd6d6c6be294a2bfbb74206a0c55e2d6946de2e',
                title: 'test_adb',
                adb_key: key },
            json: true };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
    } else if (error) {
        console.log("error:"+error);
    } else {
        console.log("stderr:"+stderr);
    }
}

function putsAdbRemove(error, stdout, stderr) {
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
                api_key: 'e9addbf55ab34ba8bd3cebe67dd6d6c6be294a2bfbb74206a0c55e2d6946de2e',
                adb_key: key },
            json: true };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
    } else if (error) {
        console.log("error:"+error);
    } else {
        console.log("stderr:"+stderr);
    }
}

openIp();
