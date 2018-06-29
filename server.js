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
    "allowedEncodings": ['CP850','UTF-8'],
    "failFast": true
};

var conf = {
    "port": extConf.port || defaults.port,
    "host": extConf.host || defaults.host,
    "server":  extConf.server || defaults.server,    
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

if (conf.failFast===undefined){
    conf.failFast=defaults.failFast;
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
        '<h1>Dr. Processor is here with it\'s API</h1><img src="https://user-images.githubusercontent.com/837211/29552552-25ad0ec8-8718-11e7-8020-b1d85c12c872.png"/>' +
        '<a href="https://github.com/cismet/doc-processor">' +
        '<img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png">' +
        '</a>' +
        '<div style="position: absolute; bottom: 5px;"><h4>done with <i class="em em-heart"></i> from <a href="https://cismet.de/en">cismet.de</a></h4  ></div>' +
        '</html>';
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();
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
            processors[req.params.processor].download(req.params.hash,req.params.dlname,conf,res, next);
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
    server.conf.deleteFilesEvenOnErrors=true;
}
module.exports = server;