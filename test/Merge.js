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
    describe('GET /api/wrongprocessor/and/wait', () => {
        it('it should return a 405 status code +  description (wrong processor)', (done) => {
            chai.request(server)
                .get('/api/wrongprocessor/and/wait')
                .end((err, res) => {
                    res.should.have.status(405);
                    res.body.should.be.equal("No processor found. And wrong method. Sad!");
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
                                            });
                                        });

                                    });
                                });

                            });
                        });
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
                                            });
                                        });

                                    });
                                });

                            });
                        });
                    });
                });
        });
    });




});