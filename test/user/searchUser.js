const supertest = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');

require('dotenv').config();

const User = mongoose.model('User');

const { expect } = require('chai');

const request = supertest(app);

describe('Search Tests', () => {
  const userDetails = {
    email: 'jeremiaholufayo@gmail.com',
    password: 'olufayo'
  };

  // run once before tests
  before((done) => {
    mongoose.connect(process.env.CFH_TESTDB, () => {
      const user = new User(userDetails);
      user.save();
      done();
    });
  });

  it('should return an error if user does not exist', (done) => {
    request
      .post('/api/search/users')
      .send({
        searchTerm: 'jfh123'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.have.property('error')
          .eql('User not found');
        done();
      });
  });

  it('should return user if user exist', (done) => {
    request
      .post('/api/search/users')
      .send({
        searchTerm: 'jeremiah'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message')
          .eql('Successfully found users');
        expect(res.body).to.have.property('foundUsers')
          .to.be.an('array');
        done();
      });
  });

  // run once after tests
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });
});
