'use strict';
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let pdfjsLib = require('pdfjs-dist');
let binaryParser = require('./lib/Tools.js').binaryParser;
let JSZip = require('jszip');

chai.use(chaiHttp);

describe('ZIP Tests', () => {
    beforeEach((done) => { //Before each test we empty the database
        //Nothing atm 
        //console.log("beforeEach ...");
        done();
    });
    describe('GET /api/zip/and/wait', () => {
        it('it should return a 405 status code +  description (right processor)', (done) => {
            chai.request(server)
                .get('/api/zip/and/wait')
                .end((err, res) => {
                    res.should.have.status(405);
                    res.body.should.be.equal("Route ok. But you should POST your request.");
                    done();
                });
        });
    });


    describe('POST /api/zip/and/wait', () => {
        it('it should download and zip the given pdfs. The result should be in the right structure', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf00",
                "files": [{
                        "uri": "http://localhost:" + port + "/testresources/1.pdf",
                        "folder": "a"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/2.pdf",
                        "folder": "b"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/3.pdf",
                        "folder": "z"
                    },
                ]
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .buffer()
                .parse(binaryParser)
                .end((err, res) => {
                    res.should.have.status(200);
                    JSZip.loadAsync(res.body).then(function (zip) {
                        zip.should.have.property('files');
                        zip.files.should.have.property('a/');
                        zip.files['a/'].dir.should.be.true;
                        zip.files.should.have.property('a/1.pdf');
                        zip.files.should.have.property('b/');
                        zip.files['b/'].dir.should.be.true;
                        zip.files.should.have.property('b/2.pdf');
                        zip.files.should.have.property('z/');
                        zip.files['z/'].dir.should.be.true;
                        zip.files.should.have.property('z/3.pdf');
                        done();
                    }).catch((error) => {
                        done(error);
                    });
                });
        });
    });


    describe('POST /api/zip/and/wait', () => {
        it('it should download and zip the given pdfs. The result should be in the right structure (multiple files in one folder)', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf01",
                "files": [{
                        "uri": "http://localhost:" + port + "/testresources/1.pdf",
                        "folder": "a"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/2.pdf",
                        "folder": "b"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/3.pdf",
                        "folder": "z"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/4.pdf",
                        "folder": "z"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/5.pdf",
                        "folder": "z"
                    },
                ]
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .buffer()
                .parse(binaryParser)
                .end((err, res) => {
                    res.should.have.status(200);
                    JSZip.loadAsync(res.body).then(function (zip) {
                        zip.should.have.property('files');
                        zip.files.should.have.property('a/');
                        zip.files['a/'].dir.should.be.true;
                        zip.files.should.have.property('a/1.pdf');
                        zip.files.should.have.property('b/');
                        zip.files['b/'].dir.should.be.true;
                        zip.files.should.have.property('b/2.pdf');
                        zip.files.should.have.property('z/');
                        zip.files['z/'].dir.should.be.true;
                        zip.files.should.have.property('z/3.pdf');
                        zip.files.should.have.property('z/4.pdf');
                        zip.files.should.have.property('z/5.pdf');
                        done();
                    }).catch((error) => {
                        done(error);
                    });
                });
        });
    });
    describe('POST /api/zip/and/wait with wrong conf object (wrong atttributes)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "nameX": "conf02",
                "filesX": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with wrong conf object (no file array)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf03",
                "files": {
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with wrong conf object (no name)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "files": {
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with non existing files in conf object', () => {
        it('it should return status code 500 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf05",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/nonExisting.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.text.should.be.equal("At least one document could not be retrieved.");
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with existing and non-existing files in conf object', () => {
        it('it should return status code 500 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf06",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }, {
                    "uri": "http://localhost:" + port + "/testresources/nonExisting.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.text.should.be.equal("At least one document could not be retrieved.");
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with only prohibited files in conf object', () => {
        it('it should return status code 403 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf07",
                "files": [{
                    "uri": "http://127.0.0.1:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }]
            }
            server.conf.targetWhitelist = "^(http|https):\\/\\/localhost:\\d*\\/.*"
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.be.equal('Forbidden. No Download for you. -.-');
                    done();
                });
        });
    });
    describe('POST /api/zip/and/wait with existing files but also prohibited files in conf object', () => {
        it('it should return status code 403 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf08",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }, {
                    "uri": "http://127.0.0.1:" + port + "/testresources/2.pdf",
                    "folder": "a"
                }]
            }
            server.conf.targetWhitelist = "^(http|https):\\/\\/localhost:\\d*\\/.*"
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.be.equal('Forbidden. No Download for you. -.-');
                    done();
                });
        });
    });

   describe('POST /api/zip/and/wait with only prohibited files in conf object and disabled the whitelisting again', () => {
        it('it should return status code 200', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf09",
                "files": [{
                    "uri": "http://127.0.0.1:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }]
            }
            let wlBackup = server.conf.targetWhitelist;
            server.conf.targetWhitelist = '';
            chai.request(server)
                .post('/api/zip/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

});