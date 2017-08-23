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

if (extConf.customExtensions !== undefined) {
    var customExtensions = require(extConf.customExtensions);
    // console.log("custom extensions loaded from " + configuration.custom);
} else {
    debug("no custom extensions loaded");
}

var defaults = {
    "port": 8081,
    "host": "0.0.0.0",
    "workers": 10,
    "tmpFolder": "./tmp",
    "keepFilesForDebugging": false,
    "speechComments": false,
    "processors": ["zip", "pdfmerge"]
};

var conf = {
    "port": extConf.port || defaults.port,
    "host": extConf.host || defaults.host,
    "workers": extConf.workers || defaults.workers,
    "tmpFolder": extConf.tmpFolder || defaults.tmpFolder,
    "keepFilesForDebugging": extConf.keepFilesForDebugging || defaults.keepFilesForDebugging,
    "speechComments": extConf.speechComments || defaults.speechComments,
};

if (!fs.existsSync(conf.tmpFolder)) {
    fs.mkdirSync(conf.tmpFolder);
}

function log(message, nonce) {
    fs.appendFile(conf.tmpFolder + "processing_of_" + nonce + ".log", message + '\n');
}


function respondWithHelloWorld(req, res, next) {
    var body = '<html style="font-family: sans-serif;text-align:center"><link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet">'+
    '<h1>Dr. Processor is here with it\'s API</h1><img src="https://user-images.githubusercontent.com/837211/29552552-25ad0ec8-8718-11e7-8020-b1d85c12c872.png"/>'+
    '<a href="https://github.com/cismet/doc-processor">'+
    '<img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png">'+
    '</a>'+
    '<div style="position: absolute; bottom: 5px;"><h4>done with <i class="em em-heart"></i> from <a href="https://cismet.de/en">cismet.de</a></h4></div>'+
    '</html>'; 
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();
}

function respondForGETProcessAndWait(req, res, next) {
    if (processors[req.params.processor] !== undefined && typeof processors[req.params.processor] === 'function') {
        res.send(405, 'Route ok. But you should POST your request.')
        //processors[req.params.processor](conf, demoJobConfig, res, next);
        // res.send('Dr. Processor is here with processor='+req.params.processor+'but you should POST your request.');
    } else {
        res.send(405, 'No processor found. And wrong method. Sad!')
    }
    next();
}


function respondForPOSTProcessAndWait(req, res, next) {
    if (processors[req.params.processor] !== undefined && typeof processors[req.params.processor] === 'function') {
        if (req.body !== undefined && req.body.name !== undefined && req.body.files !== undefined && Array.isArray(req.body.files)) {
            processors[req.params.processor](conf, req.body, res, next);
        } else {
            res.send(400, 'Your request is confusing. Please check.')
        }
    } else {
        res.send(404, 'No processor found. Right method though.')
    }
    next();
}

var server = restify.createServer();
//server.use(restify.acceptParser(server.acceptable));
//server.use(restify.queryParser());
server.use(restifyBodyParser());


server.get('/', respondWithHelloWorld);
server.get('/api', respondWithHelloWorld);
server.get('/api/:processor/and/wait', respondForGETProcessAndWait);
server.post('/api/:processor/and/wait', respondForPOSTProcessAndWait);


server.pre(restify.pre.userAgentConnection());
server.conf = conf;

if (process.env.NODE_ENV === 'test') {
    server.get(/\/testresources\/?.*/, restify.plugins.serveStatic({
        directory: __dirname,
        default: '/index.html'
    }));
}
module.exports = server;