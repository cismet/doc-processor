'use strict';
const debug = require('debug')('doc-processor-server')  
var clustered_node = require("clustered-node");
var server = require('./server');
clustered_node.listen({port: server.conf.port, host: server.conf.host, workers: server.conf.workers}, server);
debug("doc-processor started")
