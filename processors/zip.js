var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var fs = require('fs');
var md5 = require('js-md5');
var async = require('async');
var http = require('http');
var https = require('https');
var path = require('path');
var urlencode = require('urlencode');
const debug = require('debug')('doc-processor-server')
let downloadHelper = require('./lib/tools.js').downloadHelper;

exports.download = function download(hash, dlname, conf, res, next) {
    downloadHelper("zip", "zip", hash, dlname, conf, res, next);
}
exports.zip = function zip(result, conf, job, res, next) {
    debug("zip process started");
    let rnd = Math.floor(Math.random() * 1000)
    let hash = md5(JSON.stringify(job));
    let nonce = hash + "-" + rnd
    //Mkdirs
    let jobdir = conf.tmpFolder + "/job-zip-" + nonce;
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
        var urlencodedFilename = urlencode(path.basename(task.uri));
        var urlprefix = path.dirname(task.uri);
        var url = urlprefix + "/" + urlencodedFilename;
        var file = fs.createWriteStream(indir + "/" + task.folder + "/" + filename);
        debug("go for " + url);
        if ((task.uri.startsWith("https"))) {
            var request = https.get(url, function (response) {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close();
                        next();
                    });
                } else {
                    let e = new Error("At least one document could not be retrieved.");
                    if (conf.deleteFilesEvenOnErrors) {
                        debug("remove " + jobdir);
                        execSync("rm -rf  " + jobdir);
                    }
                    debug("Error retrieving (failFast="+conf.failFast+") "+url);
                    // res.writeHead(e.code);
                    // res.end(e.message);
                    if (conf.failFast===true) {
                        res.send(new Error("Error retrieving "+url));     
                    }
                    else {
                        file.close();
                        next();
                    }
                }
            });
        } else {
            var request = http.get(url, function (response) {
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
                  //  res.writeHead(e.code);
                    //res.end(e.message);
                    if (conf.failFast===true) {
                        res.send(new Error("Error retrieving "+url));     
                    }
                    else {
                        file.close();
                        next();
                    }
                }
            });

        }
    }, function (err) {
        debug(job.files.length + ' downloads finished');
        //Zip the results
        if (!err) {

            //Only changes the encoding of the filenames
            let encodingCMD="";
            if (job.encoding && conf.allowedEncodings.indexOf(job.encoding)!=-1) {
                encodingCMD="convmv --notest -r -f "+conf.serverSourceEncoding+" -t "+job.encoding+" * && ";
            }

            var cmd = encodingCMD+"zip -r -X ../out.zip *"
            execAsync(cmd, {
                "cwd": indir
            }, function (error, stdout, stderr) {

                if (error) {
                    let e = {
                        code: 500,
                        message: "Error within the zip command."
                    };
                    if (conf.deleteFilesEvenOnErrors) {
                        debug("remove " + jobdir);
                        execSync("rm -rf  " + jobdir);
                    }
                    //res.writeHead(e.code);
                    //res.end(e.message);
                    debug(error);
                    res.send(new Error("Error within the zip command.",error));     

                } else {
                    //return the result
                    var filepath = jobdir + "/out.zip";
                    fs.readFile(filepath, function (err, data) {
                        if (err) {
                            if (conf.deleteFilesEvenOnErrors) {
                                debug("remove " + jobdir);
                                execSync("rm -rf  " + jobdir);
                            }
                            let e = {
                                code: 500,
                                message: "Could not find the output file."
                            };
                            // res.writeHead(e.code);
                            // res.end(e.message);
                            res.send(new Error("Could not find the output file.",err));     
                            return;
                        }
                        if (result === 'DOWNLOAD') {
                            res.writeHead(200, {
                                "Content-Disposition":"filename=" + job.name + ".zip",
                                "Content-Type":"application/zip"
                            });
                            res.end(data);
                            if (!conf.keepFilesForDebugging) {
                                debug("remove " + jobdir);
                                execSync("rm -rf  " + jobdir);
                            }
                            return next();
                        } else if (result === 'STATUS') {
                            res.contentType = 'application/json'
                            //res.writeHead(200);
                            res.send(200, {
                                status: 200,
                                id: nonce,
                                href: conf.server+"/api/download/zip/"+nonce+"/"+job.name
                                
                            });
                            return next();
                        } else {
                            throw {
                                error: "result has to be either DOWNLOAD or STATUS (it was " + result + ")"
                            };
                            return next();
                        }


                    });

                }
            });
        } else {
            if (conf.deleteFilesEvenOnErrors) {
                debug("remove " + jobdir);
                execSync("rm -rf  " + jobdir);
            }
            debug("Zipping skipped due to an error", err);
            res.send(new Error("Zipping skipped due to an error", err));            
            return next();
        }
    });
}