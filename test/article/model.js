// /**
//  * Module dependencies.
//  */
// // const app = require('../../server');
// const should = require('should');
// const mongoose = require('mongoose');

// const User = mongoose.model('User');
// const Article = mongoose.model('Article');

// // Globals
// let user;
// let article;

// // The tests
// describe('<Unit Test>', () => {
//   describe('Model Article:', () => {
//     beforeEach((done) => {
//       user = new User({
//         name: 'Full name',
//         email: 'test@test.com',
//         username: 'user',
//         password: 'password'
//       });

//       user.save(() => {
//         article = new Article({
//           title: 'Article Title',
//           content: 'Article Content',
//           user
//         });

//         done();
//       });
//     });

//     describe('Method Save', () => {
//       it('should be able to save whithout problems', done => article.save((err) => {
//         should.not.exist(err);
//         done();
//       }));

//       it('should be able to show an error when try to save witout title', (done) => {
//         article.title = '';

//         return article.save((err) => {
//           should.exist(err);
//           done();
//         });
//       });
//     });

//     afterEach((done) => {
//       done();
//     });
//   });
// });
