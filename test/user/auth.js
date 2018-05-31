const supertest = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');

require('dotenv').config();

const User = mongoose.model('User');

const { expect } = require('chai');

const request = supertest(app);

describe('Signin Tests', () => {
  const userDetails = {
    email: 'jeremiaholufayo@gmail.com',
    password: 'olufayo'
  };

  // Run once before tests
  before((done) => {
    mongoose.connect(process.env.CFH_TESTDB, () => {
      const user = new User(userDetails);
      user.save();
      done();
    });
  });

  // Run once after tests
  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  it('should not signin a user without email', (done) => {
    request
      .post('/api/auth/login')
      .send({
        password: 'olufayo'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.have.property('error')
          .eql('Your Email Address is required');
        done();
      });
  });

  it('should not signin a user without password', (done) => {
    request
      .post('/api/auth/login')
      .send({
        email: 'jeremiaholufayo@gmail.com'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.have.property('error')
          .eql('Your Password is required');
        done();
      });
  });

  it('should not signin a user with an invalid email', (done) => {
    request
      .post('/api/auth/login')
      .send({
        email: 'jeremiaholufayogmail.com'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body).to.have.property('error')
          .eql('Provide a valid Email Address');
        done();
      });
  });

  it('should not signin a user with wrong details', (done) => {
    request
      .post('/api/auth/login')
      .send({
        email: 'jeremiaholufayo@gmail.com',
        password: 'jerry'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.equal('Username or Password Incorrect');
        done();
      });
  });

  it('should signin a user with correct details', (done) => {
    request
      .post('/api/auth/login')
      .send({
        email: 'jeremiaholufayo@gmail.com',
        password: 'olufayo'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.message).to.equal('Successfully SignIn');
        expect(res.body.token).to.not.equal(null);
        done();
      });
  });
});
