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

describe('Basic Tests', () => {
  beforeEach((done) => { //Before each test we empty the database
    //Nothing atm 
    //console.log("beforeEach ...");
    done();
  });

  describe('GET /', () => {
    it('it should return a welcome message', (done) => {
      chai.request(server)
        .get('/api')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.equal("Dr. Processor is here with it's API");
          done();
        });
    });
  });
  describe('GET /api', () => {
    it('it should return a welcome message', (done) => {
      chai.request(server)
        .get('/api')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.equal("Dr. Processor is here with it's API");
          done();
        });
    });
  });
  describe('GET /wrongRoute', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/wrongRoute')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /testresources', () => {
    it('it should return a testresources message', (done) => {
      chai.request(server)
        .get('/testresources/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.not.be.null;
          done();
        });
    });
  });

  describe('GET /testresources/1.pdf', () => {
    it('it should return a testpdf with content 1', (done) => {
      chai.request(server)
        .get('/testresources/1.pdf')
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
              });
            });
          });
        });
    });
  });

  describe('GET /testresources/2.pdf', () => {
    it('it should return a testpdf with content 2', (done) => {
      chai.request(server)
        .get('/testresources/2.pdf')
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
                textContent.items[0].str.should.be.equal("2");
                done();
              });
            });
          });
        });
    });
  });

  describe('GET /testresources/3.pdf', () => {
    it('it should return a testpdf with content 3', (done) => {
      chai.request(server)
        .get('/testresources/3.pdf')
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
                textContent.items[0].str.should.be.equal("3");
                done();
              });
            });
          });
        });
    });
  });

  describe('GET /testresources/4.pdf', () => {
    it('it should return a testpdf with content 4', (done) => {
      chai.request(server)
        .get('/testresources/4.pdf')
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
                textContent.items[0].str.should.be.equal("4");
                done();
              });
            });
          });
        });
    });
  });

  describe('GET /testresources/5.pdf', () => {
    it('it should return a testpdf with content 5', (done) => {
      chai.request(server)
        .get('/testresources/5.pdf')
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
                textContent.items[0].str.should.be.equal("5");
                done();
              });
            });
          });
        });
    });
  });
  describe('GET /testresources/1.txt', () => {
    it('it should return a textfile with content 1', (done) => {
      chai.request(server)
        .get('/testresources/1.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.startsWith("1").should.be.true;
          done();
        });
    });
  });
   describe('GET /testresources/2.txt', () => {
    it('it should return a textfile with content 2', (done) => {
      chai.request(server)
        .get('/testresources/2.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.startsWith("2").should.be.true;
          done();
        });
    });
  });
  describe('GET /testresources/3.txt', () => {
    it('it should return a textfile with content 3', (done) => {
      chai.request(server)
        .get('/testresources/3.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.startsWith("3").should.be.true;
          done();
        });
    });
  });
  describe('GET /testresources/4.txt', () => {
    it('it should return a textfile with content 4', (done) => {
      chai.request(server)
        .get('/testresources/4.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.startsWith("4").should.be.true;
          done();
        });
    });
  });
 describe('GET /testresources/5.txt', () => {
    it('it should return a textfile with content 5', (done) => {
      chai.request(server)
        .get('/testresources/5.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.startsWith("5").should.be.true;
          done();
        });
    });
  });



});