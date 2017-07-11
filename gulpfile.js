const gulp = require('gulp'),
  nodemon = require('gulp-nodemon');


gulp.task('dev', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {
      PORT: 8080,
      NODE_ENV : 'development',
      SERIALPORT: process.argv[3]? process.argv[3].slice(1, process.argv[3].length): null
    },
    ignore: ['./node_modules/**']
  })
    .on('restart', function () {
      console.log('Restarting server...');
    });
});

gulp.task('run', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {
      PORT: 8080,
      NODE_ENV : 'production'
    },
    ignore: ['./node_modules/**']
  })
    .on('restart', function () {
      console.log('Restarting server...');
    });
});