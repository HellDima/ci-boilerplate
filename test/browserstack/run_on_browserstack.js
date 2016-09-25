#!/usr/bin/env node
var fs = require('fs');
var logfile = 'bs.log';
var WORKER_ID = 0;
var BrowserStack = require('browserstack');
var name = null;

function log(msg) {
	//fs.appendFileSync(logfile, msg + '\n');
}

function clearLog() {
	//fs.writeFileSync(logfile, '');
}

clearLog();

log('creating browserstack client');

var client = BrowserStack.createClient({
	username: process.env.BROWSERSTACK_USERNAME,
	password: process.env.BROWSERSTACK_KEY
});

log('browserstack client created');

'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function (evt) {
	process.on(evt, function () {
		log("Closed BrowserStack Worker process " + evt);
		if (client !== null) {
			client.terminateWorker(WORKER_ID, function () {
				process.exit();
			});
		}
	});
});

var url = '',
	realMobile = false;

log('process.argv.length = ' + process.argv.length);

if (process.argv.length === 8) { // desktop
	url = process.argv[7];
} else { // mobile
	realMobile = process.argv[7] === 'true';
	url = process.argv[8];
}

var settings = {
	os: process.argv[2],
	os_version: process.argv[3],
	browser: process.argv[4],
	browser_version: process.argv[5],
	device: process.argv[6],
	realMobile: realMobile,
	url: url,

	'browserstack.local': true,
	name: name,
	build: 'test project',
	timeout: 600
};

for (var i in settings) {
	if (settings[i] === null || settings[i] === '' || settings[i] === 'nil') {
		delete settings[i];
	}
}

log('worker settings: ' + JSON.stringify(settings));

client.createWorker(settings, function (error, worker) {
	if (error) {
		log(error);
	}
	WORKER_ID = worker.id
});

setTimeout(function () {
	client.terminateWorker(WORKER_ID);
}, 600000);