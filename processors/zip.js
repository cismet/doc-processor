var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var fs = require('fs');
var mime = require('mime');
var async = require('async');
var http = require('http');
var https = require('https');
var path = require('path');
const debug = require('debug')('doc-processor-server')

exports.zip = function zip(conf, job, res, next) {
    var nonce = job.name + "-" + Math.floor(Math.random() * 10000000);
    //var nonce = "1337";
    if (conf.speechComments) {
        execSync("say 'ZIP-Verarbeitung gestartet'");
    } else {
        debug("zip process started");
    }

    //Mkdirs
    var jobdir = conf.tmpFolder + "/job-zip-" + nonce;
    var indir = jobdir + "/in"
    fs.mkdirSync(jobdir);
    fs.mkdirSync(indir);

    //Download
    var threads = 15;
    async.eachLimit(job.files, threads, function (task, next) {
        if (!fs.existsSync(indir + "/" + task.folder)) {
            fs.mkdirSync(indir + "/" + task.folder);
        }
        var filename = path.basename(task.uri);
        var file = fs.createWriteStream(indir + "/" + task.folder + "/" + filename);
        if ((task.uri.startsWith("https"))) {
            var request = https.get(task.uri, function (response) {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close();
                        next();
                    });
                } else {
                    let e = {
                        code: 500,
                        message: "At least one document could not be retrieved."
                    };
                    res.writeHead(e.code);
                    res.end(e.message);
                    next(e);
                }
            });
        } else {
            var request = http.get(task.uri, function (response) {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close();
                        next();
                    });
                } else {
                    let e = {
                        code: 500,
                        message: "At least one document could not be retrieved."
                    };
                    res.writeHead(e.code);
                    res.end(e.message);
                    next(e);
                }
            });

        }
    }, function (err) {
        debug(job.files.length + ' downloads finished');
        //Zip the results
        if (!err) {
            var zipCmd = "zip -r -X ../out.zip *"
            execAsync(zipCmd, {
                "cwd": indir
            }, function (error, stdout, stderr) {

                if (error) {
                    let e = {
                        code: 500,
                        message: "Error within the zip command."
                    };
                    res.writeHead(e.code);
                    res.end(e.message);
                    next(e);
                    debug(error);
                } else {
                    //return the result
                    var filepath = jobdir + "/out.zip";
                    fs.readFile(filepath, function (err, data) {
                        if (err) {
                            res.writeHead(500);
                            res.end(":--( : " + err);
                            next(err);
                            return;
                        }

                        res.contentType = mime.lookup(filepath);
                        res.writeHead(200, {
                            "Content-Disposition": "attachment;filename=" + job.name + ".zip"
                        });
                        res.end(data);
                        if (!conf.keepFilesForDebugging) {
                            debug("remove " + jobdir);
                            execSync("rm -rf  " + jobdir);
                        }
                        return next();
                    });
                }
            });
        } else {
            debug("Zipping skipped due to an error", err);
        }
    });
}