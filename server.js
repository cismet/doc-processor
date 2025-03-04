var restify = require('restify');
var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var async = require('async');
var extConf = require('./config.json');
var fs = require('fs');
var processors = require('./processors');
var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var restifyBodyParser = require('restify-plugins').bodyParser;
const debug = require('debug')('doc-processor-server')
const corsMiddleware = require('restify-cors-middleware')

let STATUS = 'STATUS';
let DOWNLOAD = 'DOWNLOAD';

if (extConf.customExtensions !== undefined) {
    var customExtensions = require(extConf.customExtensions);
    // console.log("custom extensions loaded from " + configuration.custom);
} else {
    debug("no custom extensions loaded");
}

var defaults = {
    "port": 8081,
    "host": "0.0.0.0",
    "server": "http://localhost:8081",
    "workers": 1,
    "tmpFolder": "./tmp",
    "keepFilesForDebugging": false,
    "deleteFilesEvenOnErrors": false,
    "processors": ["zip", "pdfmerge"],
    "targetWhitelist": "",
    "corsAccessControlAllowOrigins": ['http://localhost:*'],
    "serverSourceEncoding": 'UTF-8',
    "allowedEncodings": ['CP850', 'UTF-8'],
    "failFast": true
};

var conf = {
    "port": extConf.port || defaults.port,
    "host": extConf.host || defaults.host,
    "server": extConf.server || defaults.server,
    "workers": extConf.workers || defaults.workers,
    "tmpFolder": extConf.tmpFolder || defaults.tmpFolder,
    "keepFilesForDebugging": extConf.keepFilesForDebugging || defaults.keepFilesForDebugging,
    "targetWhitelist": extConf.targetWhitelist || defaults.targetWhitelist,
    "deleteFilesEvenOnErrors": extConf.deleteFilesEvenOnErrors || defaults.deleteFilesEvenOnErrors,
    "corsAccessControlAllowOrigins": extConf.corsAccessControlAllowOrigins || defaults.corsAccessControlAllowOrigins,
    "serverSourceEncoding": extConf.serverSourceEncoding || defaults.serverSourceEncoding,
    "allowedEncodings": extConf.allowedEncodings || defaults.allowedEncodings,
    "failFast": extConf.failFast
};

if (conf.failFast === undefined) {
    conf.failFast = defaults.failFast;
}

debug("CONFIG:");
debug(conf);


if (!fs.existsSync(conf.tmpFolder)) {
    fs.mkdirSync(conf.tmpFolder);
}

function log(message, nonce) {
    fs.appendFile(conf.tmpFolder + "processing_of_" + nonce + ".log", message + '\n');
}

function respondWithHelloWorld(req, res, next) {
    var body = '<html style="font-family: sans-serif;text-align:center"><link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet">' +
        '<style>' +
        '.github-corner { position: absolute; top: 0; right: 0; }' +
        '.github-corner:hover .octo-arm { animation: octocat-wave 560ms ease-in-out; }' +
        '@keyframes octocat-wave {' +
        '0%, 100% { transform: rotate(0); }' +
        '20%, 60% { transform: rotate(-25deg); }' +
        '40%, 80% { transform: rotate(10deg); }' +
        '}' +
        '@media (max-width: 500px) {' +
        '.github-corner:hover .octo-arm { animation: none; }' +
        '.github-corner .octo-arm { animation: octocat-wave 560ms ease-in-out; }' +
        '}' +
        '</style>' +
        '<h1>Dr. Processor is here with it\'s API</h1><img src="https://user-images.githubusercontent.com/837211/29552552-25ad0ec8-8718-11e7-8020-b1d85c12c872.png"/>' +
        '<a href="https://github.com/cismet/doc-processor" class="github-corner" aria-label="View source on GitHub">' +
        '<svg width="80" height="80" viewBox="0 0 250 250" style="fill:#6d6d6d; color:#fff;" aria-hidden="true">' +
        '<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>' +
        '<path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>' +
        '<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>' +
        '</svg>' +
        '</a>' +
        '<div style="position: absolute; bottom: 5px;"><h4>done with <i class="em em-heart"></i> from <a href="https://cismet.de/en">cismet.de</a></h4></div>' +
        '</html>';
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();
    return next();
}

function respondForGETProcessAndWaitForX(req, res, next) {
    if (processors[req.params.processor] !== undefined && typeof processors[req.params.processor] === 'function') {
        res.send(405, 'Route ok. But you should POST your request.')
    } else {
        res.send(405, 'No processor found. And wrong method. Sad!')
    }
    next();
}

function respondForPOSTProcessAndWaitForDownload(req, res, next) {
    respondForPOSTProcessAndWait(DOWNLOAD, req, res, next)
}
function respondForPOSTProcessAndWaitForStatus(req, res, next) {
    respondForPOSTProcessAndWait(STATUS, req, res, next)
}

function respondForPOSTProcessAndWait(what, req, res, next) {
    var jsonBody;
    if (req.body !== undefined && req.body.data !== undefined) {
        //Form submission in a data attribute
        jsonBody = JSON.parse(req.body.data);
    } else {
        //regular json body submission
        jsonBody = req.body;
    }

    let check = requestTest(req, jsonBody);

    if (check.code == 200) {
        processors[req.params.processor](what, conf, jsonBody, res, next);
    } else {
        res.send(check.code, check.message);
    }
    next();
}

function respondForGETDownloadResult(req, res, next) {
    if (req.params.processor !== undefined &&
        processors[req.params.processor] !== undefined &&
        typeof processors[req.params.processor].download === 'function' &&
        req.params.hash !== undefined &&
        req.params.dlname !== undefined
    ) {
        processors[req.params.processor].download(req.params.hash, req.params.dlname, conf, res, next);
    }
    else {
        res.send(400, 'Your request is confusing. Please check');

    }
}

function requestTest(req, jsonBody) {
    if (processors[req.params.processor] !== undefined && typeof processors[req.params.processor] === 'function') {
        if (jsonBody !== undefined && jsonBody.name !== undefined && jsonBody.files !== undefined && Array.isArray(jsonBody.files)) {
            if (conf.targetWhitelist !== undefined && conf.targetWhitelist !== '') {
                var targetWhitelistMatcher = new RegExp(conf.targetWhitelist);
                var whiteListCheck = true;
            } else {
                var whiteListCheck = false;
            }
            for (let index = 0; index < jsonBody.files.length; ++index) {
                let file = jsonBody.files[index];
                if (file.uri === undefined) {
                    return {
                        code: 400,
                        message: 'Your request is confusing. Please check.'
                    }
                }
                if (whiteListCheck && !targetWhitelistMatcher.test(file.uri)) {
                    return {
                        code: 403,
                        message: 'Forbidden. No Download for you. -.-'
                    }
                }
            }
            return {
                code: 200,
                message: "Good. Thank you."
            }
        } else {
            return {
                code: 400,
                message: 'Your request is confusing. Please check.'
            }
        }
    } else {
        return {
            code: 404,
            message: 'No processor found. Right method though.'
        }
    }
}

var server = restify.createServer();
//server.use(restify.acceptParser(server.acceptable));
//server.use(restify.queryParser());
server.use(restifyBodyParser());
const cors = corsMiddleware({
    origins: conf.corsAccessControlAllowOrigins,
})

server.pre(cors.preflight)
server.use(cors.actual)


server.get('/', respondWithHelloWorld);
server.get('/api', respondWithHelloWorld);
server.get('/api/:processor/and/wait/for/download', respondForGETProcessAndWaitForX);
server.get('/api/:processor/and/wait/for/status', respondForGETProcessAndWaitForX);
server.post('/api/:processor/and/wait/for/download', respondForPOSTProcessAndWaitForDownload);
server.post('/api/:processor/and/wait/for/status', respondForPOSTProcessAndWaitForStatus);
server.get('/api/download/:processor/:hash/:dlname', respondForGETDownloadResult);


server.pre(restify.pre.userAgentConnection());
server.conf = conf;

if (process.env.NODE_ENV === 'test') {
    server.get(/\/testresources\/?.*/, restify.plugins.serveStatic({
        directory: __dirname,
        default: '/index.html'
    }));
    server.conf.deleteFilesEvenOnErrors = true;
}
module.exports = server;