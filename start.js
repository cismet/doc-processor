'use strict';
var clustered_node = require("clustered-node");
var server = require('./server');
clustered_node.listen({port: server.conf.port, host: server.conf.host, workers: server.conf.workers}, server);
console.log("Started")
