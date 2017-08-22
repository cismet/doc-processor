'use strict';
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let pdfjsLib = require('pdfjs-dist');
let binaryParser = require('./lib/Tools.js').binaryParser;


chai.use(chaiHttp);

describe('PDF-Merge Tests', () => {
    beforeEach((done) => { //Before each test we empty the database
        //Nothing atm 
        //console.log("beforeEach ...");
        done();
    });

    describe('GET /api/pdfmerge/and/wait', () => {
        it('it should return a 405 status code +  description (right processor)', (done) => {
            chai.request(server)
                .get('/api/pdfmerge/and/wait')
                .end((err, res) => {
                    res.should.have.status(405);
                    res.body.should.be.equal("Route ok. But you should POST your request.");
                    done();
                });
        });
    });
 
    describe('POST /api/pdfmerge/and/wait', () => {
        it('it should download and merge the given pdfs. The result should be 1,2,3', (done) => {
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
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .buffer()
                .parse(binaryParser)
                .end((err, res) => {
                    res.should.have.status(200);
                    pdfjsLib.getDocument({
                        data: res.body
                    }).then(function (doc) {
                        var numPages = doc.numPages;
                        doc.numPages.should.be.equal(3);
                        doc.getPage(1).then(function (page) {
                            page.getTextContent().then(function (textContent) {
                                textContent.items[0].str.should.be.equal("1");
                                doc.getPage(2).then(function (page) {
                                    page.getTextContent().then(function (textContent) {
                                        textContent.items[0].str.should.be.equal("2");
                                        doc.getPage(3).then(function (page) {
                                            page.getTextContent().then(function (textContent) {
                                                textContent.items[0].str.should.be.equal("3");
                                                done();
                                            }).catch((error) => {
                                                done(error);
                                            });
                                        }).catch((error) => {
                                            done(error);
                                        });
                                    }).catch((error) => {
                                        done(error);
                                    });
                                }).catch((error) => {
                                    done(error);
                                });
                            }).catch((error) => {
                                done(error);
                            });
                        }).catch((error) => {
                            done(error);
                        });
                    }).catch((error) => {
                        done(error);
                    });
                });
        });
    });
    describe('POST /api/pdfmerge/and/wait', () => {
        it('it should download and merge the given pdfs. The result should be 3,2,1', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf01",
                "files": [{
                        "uri": "http://localhost:" + port + "/testresources/3.pdf",
                        "folder": "a"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/2.pdf",
                        "folder": "b"
                    },
                    {
                        "uri": "http://localhost:" + port + "/testresources/1.pdf",
                        "folder": "z"
                    },
                ]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .buffer()
                .parse(binaryParser)
                .end((err, res) => {
                    res.should.have.status(200);
                    pdfjsLib.getDocument({
                        data: res.body
                    }).then(function (doc) {
                        var numPages = doc.numPages;
                        doc.numPages.should.be.equal(3);
                        doc.getPage(1).then(function (page) {
                            page.getTextContent().then(function (textContent) {
                                textContent.items[0].str.should.be.equal("3");
                                doc.getPage(2).then(function (page) {
                                    page.getTextContent().then(function (textContent) {
                                        textContent.items[0].str.should.be.equal("2");
                                        doc.getPage(3).then(function (page) {
                                            page.getTextContent().then(function (textContent) {
                                                textContent.items[0].str.should.be.equal("1");
                                                done();
                                            }).catch((error) => {
                                                done(error);
                                            });
                                        }).catch((error) => {
                                            done(error);
                                        });
                                    }).catch((error) => {
                                        done(error);
                                    });
                                }).catch((error) => {
                                    done(error);
                                });
                            }).catch((error) => {
                                done(error);
                            });
                        }).catch((error) => {
                            done(error);
                        });
                    }).catch((error) => {
                        done(error);
                    });
                });
        });
    });

    describe('POST /api/pdfmerge/and/wait', () => {
        it('it should download and merge the given pdfs. The result should contain only 1', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf02",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .buffer()
                .parse(binaryParser)
                .end((err, res) => {
                    res.should.have.status(200);
                    pdfjsLib.getDocument({
                        data: res.body
                    }).then(function (doc) {
                        var numPages = doc.numPages;
                        doc.numPages.should.be.equal(1);
                        doc.getPage(1).then(function (page) {
                            page.getTextContent().then(function (textContent) {
                                textContent.items[0].str.should.be.equal("1");
                                done();
                            }).catch((error) => {
                                done(error);
                            });
                        }).catch((error) => {
                            done(error);
                        });
                    }).catch((error) => {
                        done(error);
                    });
                });
        });
    });

    describe('POST /api/pdfmerge/and/wait with wrong conf object (wrong atttributes)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "nameX": "conf03",
                "filesX": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });

    describe('POST /api/pdfmerge/and/wait with wrong conf object (no file array)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf04",
                "files": {
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });
    describe('POST /api/pdfmerge/and/wait with wrong conf object (no name)', () => {
        it('it should return status code 400 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "files": {
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                }
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.equal("Your request is confusing. Please check.");
                    done();
                });
        });
    });
    describe('POST /api/pdfmerge/and/wait with non existing files in conf object', () => {
        it('it should return status code 500 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf06",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/nonExisting.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.text.should.be.equal("At least one document could not be retrieved.");
                    done();
                });
        });
    });
    describe('POST /api/pdfmerge/and/wait with existing and non-existing files in conf object', () => {
        it('it should return status code 500 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf07",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/1.pdf",
                    "folder": "a"
                },{
                    "uri": "http://localhost:" + port + "/testresources/nonExisting.pdf",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.text.should.be.equal("At least one document could not be retrieved.");
                    done();
                });
        });
    });

describe('POST /api/pdfmerge/and/wait with existing files but wrong types in conf object', () => {
        it('it should return status code 500 + description', (done) => {
            let port = server.address().port;
            let conf = {
                "name": "conf08",
                "files": [{
                    "uri": "http://localhost:" + port + "/testresources/1.txt",
                    "folder": "a"
                },{
                    "uri": "http://localhost:" + port + "/testresources/2.txt",
                    "folder": "a"
                }]
            }
            chai.request(server)
                .post('/api/pdfmerge/and/wait')
                .send(conf)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.text.should.be.equal("Error within the merge command.");
                    done();
                });
        });
    });


});