'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');

// Shaders livereload.
gulp.task('shaders', function() {
  gulp.src(global.paths.shaders)
    .pipe(connect.reload());
});