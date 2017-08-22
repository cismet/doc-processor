var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var fs = require('fs');
var mime = require('mime');
var async = require('async');
var http = require('http');
var https = require('https');
var path    = require('path');

exports.zip = function zip(conf, job, res, next){
    var nonce = job.name + "-"+ Math.floor(Math.random() * 10000000);
    //var nonce = "1337";
    if (conf.speechComments) {
        execSync("say 'ZIP-Verarbeitung gestartet'");
    } else{
        console.log("zip process started");
    }

    //Mkdirs
    var jobdir=conf.tmpFolder+"/job-zip-"+nonce;
    var indir=jobdir+"/in"
    fs.mkdirSync(jobdir);
    fs.mkdirSync(indir);
    
    //Download
    var threads = 15;
    async.eachLimit(job.files, threads, function(task, next){
        if (!fs.existsSync(indir+"/"+task.folder)) {
            fs.mkdirSync(indir+"/"+task.folder);
        }
        var filename = path.basename( task.uri );
        var file = fs.createWriteStream(indir+"/"+task.folder+"/"+filename);
        var request = https.get(task.uri, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
                next();
            });
        });
    }, function(){
        console.log(job.files.length+' downloads finished');
        //Zip the results
        var zipCmd= "zip -r -X ../out.zip *"
        execAsync(zipCmd, {"cwd":indir} ,function (error, stdout, stderr) {
            
            if (error) {
                console.log("ERROR");
                console.log(error);
            }
            else {
                //return the result
                var filepath= __dirname+"/../tmp/job-zip-"+nonce+"/out.zip";
                fs.readFile(filepath, function(err, data) {
                if (err) {
                    res.writeHead(500);
                    res.end(":--( : "+err);
                    next(err);
                    return;
                }
                
                res.contentType = mime.lookup(filepath);
                res.writeHead(200, {"Content-Disposition": "attachment;filename="+job.name+".zip"});
                res.end(data);
                return next();
                });
            }
        });
    });
}