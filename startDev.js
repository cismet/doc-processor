'use strict';
const debug = require('debug')('doc-processor-server')  

var server = require('./server');
server.listen(server.conf.port, function() {
    debug("doc-processor started in dev-mode")
});
