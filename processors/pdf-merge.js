var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var numeral = require('numeral');

exports.pdfmerge = function merge(conf, job, res, next) {
    if (conf.speechComments) {
        execSync("say 'PDF-Verarbeitung gestartet'");
    } else {
        console.log("pdfmerge started");
    }

};


var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var fs = require('fs');
var mime = require('mime');
var async = require('async');
var http = require('http');
var https = require('https');
var path = require('path');

exports.pdfmerge = function merge(conf, job, res, next) {
    var nonce = job.name + "-" + Math.floor(Math.random() * 10000000);
    if (conf.speechComments) {
        execSync("say 'PDF-Verarbeitung gestartet'");
    } else {
        //console.log("pdfmerge started");
    }

    //Mkdirs
    var jobdir = conf.tmpFolder + "/job-pdf-merge-" + nonce;
    var indir = jobdir + "/in"
    fs.mkdirSync(jobdir);
    fs.mkdirSync(indir);

    //Download
    var threads = 15;
    var i = 0;
    async.eachLimit(job.files, threads, function (task, next) {
        var prefix = numeral(i).format('000');
        i++;
        var filename = path.basename(task.uri);
        var file = fs.createWriteStream(indir + "/" + prefix + "-" + task.folder + "-" + filename);
        if ((task.uri.startsWith("https"))) {
            var request = https.get(task.uri, function (response) {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close();
                        next();
                    });
                } else {
                    res.writeHead(500);
                    res.end("At least one document could not be retrieved.");
                    next({code:500, message:"At least one document could not be retrieved."});
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
                    res.writeHead(500);
                    res.end("At least one document could not be retrieved.");
                    next({code:500, message:"At least one document could not be retrieved."});
                }
            });
        }
    }, function (err) {
        //console.log(job.files.length + ' downloads finished');
        //Zip the results
        if (!err) {
            var zipCmd = "pdftk *.pdf cat output ../out.pdf"
            execAsync(zipCmd, {
                "cwd": indir
            }, function (error, stdout, stderr) {

                if (error) {
                    console.log("ERROR");
                    console.log(error);
                } else {
                    //return the result
                    var filepath = jobdir + "/out.pdf";
                    fs.readFile(filepath, function (err, data) {
                        if (err) {
                            res.writeHead(500);
                            res.end(":--( : " + err);
                            next(err);
                            return;
                        }

                        res.contentType = mime.lookup(filepath);
                        res.writeHead(200, {
                            "Content-Disposition": "attachment;filename=" + job.name + ".pdf"
                        });
                        res.end(data);
                        return next();
                    });
                }
            });
        }
        else {
            //console.log("Merging skipped due to an error", err);
        }
    });
}