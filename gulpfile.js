var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

// runs all tests for pomo
gulp.task('test', function(){
    gulp.src('tests/pomo.js')
        .pipe(jasmine());
});