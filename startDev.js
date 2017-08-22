'use strict';
var server = require('./server');
server.listen(server.conf.port, function() {
    console.log("Started in Dev-Mode")
});
