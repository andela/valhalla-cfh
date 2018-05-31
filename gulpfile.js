// require all necessary modules
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const sass = require('gulp-sass');
const bower = require('gulp-bower');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
require('dotenv').config();
// initialize browserSync
browserSync.create();

// gulp task to convert sass files to css
gulp.task('sass', () => {
  gulp.src('public/css/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// gulp task to watch for changes in public and app folders
gulp.task('watch', ['sass'], () => {
  // watching changes to sass files in public folder
  gulp.watch('public/css/*.scss', ['sass']);

  // watching changes to css files in public folder
  gulp.watch('public/css/*.css', browserSync.reload);

  // watching changes to js files in public folder
  gulp.watch('public/js/*.js', browserSync.reload);

  // watching changes to html files in public folder
  gulp.watch('public/views/*.html', browserSync.reload);

  // watching changes to all js files in app folder
  gulp.watch('app/**/*.js', browserSync.reload);

  // watching changes to all jade files in app folder
  gulp.watch('app/views/**/*.jade', browserSync.reload);
});

/**
* gulp task to check for appropriate code
* quality in app folder using eslint
*/
gulp.task('eslint', () => {
  gulp.src('app/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

// gulp task to run nodemon and check for server changes
gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ext: 'js html',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  });
});

// gulp task to run mocha test
gulp.task('mochaTest', () => {
  gulp.src('test/**/*.js')
    .pipe(mocha({
      reporter: 'spec', exit: true
    }));
});

// gulp task to run nodemon and watch file changes at the same time
gulp.task('concurrent', () => {
  runSequence(['nodemon', 'watch']);
});

// gulp task to run bower installation
gulp.task('bower', () => bower({
  directory: 'public/lib'
}));

// run default task
gulp.task('default', ['concurrent']);

// run test task
gulp.task('test', ['mochaTest']);

// run bower task
gulp.task('install', ['bower']);
