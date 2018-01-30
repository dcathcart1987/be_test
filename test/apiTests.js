"use strict";
let fs = require('fs');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Tickets', () => {
    // beforeEach((done) => { 
    //     fs.copyFile('./data/data.original.json','./data/data.json', (err) => {
    //         console.error(err);
    //         done();
    //     });  
    // });

  describe('/GET available seats', () => {
      it('it should GET more than one seat', (done) => {
        chai.request(server)
            .get('/api/v1/seats/available')
            .end((err, res) => {
                console.log(Object.keys(res.body));
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('totalAvailable').gt(0);
                res.body.should.have.property('availableSeats');
              done();
            });
      });
  });

  describe('/GET reserved seats without email provided', () => {
    it('it should error because no email was provided', (done) => {
      chai.request(server)
          .get('/api/v1/seats/reserved')
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
            done();
          });
    });
});

describe('/GET held seats without email provided', () => {
    it('it should error because no email was provided', (done) => {
      chai.request(server)
          .get('/api/v1/seats/held')
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error');
            done();
          });
    });
});

describe('/POST reserved seats with email', () => {
    it('it should return that there are no reserved seats for fake@notreal.com', (done) => {
        let requestObj = {
            email: "fake@notreal.com"
        }
      chai.request(server)
          .post('/api/v1/seats/held')
          .send(requestObj)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
            done();
          });
    });
});

describe('/POST held seats with email', () => {
    it('it should return that there are no held seats for fake@notreal.com', (done) => {
        let requestObj = {
            email: "fake@notreal.com"
        }
      chai.request(server)
          .post('/api/v1/seats/held')
          .send(requestObj)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
            done();
          });
    });
});

describe('/GET best seats with number', () => {
    it('it should GET 3 best seats in the house', (done) => {
      chai.request(server)
          .get('/api/v1/seats/best?n=3')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('bestSeats');
              res.body.should.have.property('bestSeats').length(3);
            done();
          });
    });
});

describe('/GET best seats without number', () => {
    it('it should error because no number was provided in query string', (done) => {
      chai.request(server)
          .get('/api/v1/seats/best')
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
            done();
          });
    });
});

describe('/GET best seats with number', () => {
    it('it should error because number provided is too arge', (done) => {
      chai.request(server)
          .get('/api/v1/seats/best?n=300')
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('message');
              res.body.should.have.property('message').eq('No available seats for a party that size!');
            done();
          });
    });
});

});