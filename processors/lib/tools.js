var fs = require('fs');
const debug = require('debug')('doc-processor-server')
var execSync = require('child_process').execSync;

const downloadHelper = function download(processor,filetype,hash, dlname, conf, res, next) {
    let jobdir = conf.tmpFolder +"/job-"+ processor + "-" + hash;
    var filepath=jobdir+'/out.'+filetype;
    fs.readFile(filepath, function (err, data) {
        if (err) {
            let e = {
                code: 404,
                message: "Could not find the file."
            };
            res.writeHead(e.code);
            res.end(e.message);
            next(e);
            return;
        }
        // "Content-Disposition": "attachment;filename=" + dlname + "."+filetype,
        res.writeHead(200, {
           "Content-Disposition":"filename=" + dlname + "."+filetype,
           "Cache-Control":"public, max-age=0",
           "Accept-Ranges":"bytes",
           "Content-Type":"application/"+filetype,
           "Content-Length":Buffer.byteLength(data, 'utf-8')

        });
        res.end(data);
        if (!conf.keepFilesForDebugging ) {
            debug("remove " + jobdir);
            execSync("rm -rf  " + jobdir);
        }
        return next();
    });
}
exports.downloadHelper = downloadHelper;