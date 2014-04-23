var gulp = require('gulp'),
jasmine = require('gulp-jasmine'),
concat = require('gulp-concat')
uglify = require('gulp-uglify');

var blocks = [
    'src/parts/iife-open.js',
    'src/parts/util.js',
    'src/parts/errors.namespace.js',
    'src/parts/errors.base.js',
    'src/parts/errors.custom_error.js',
    'src/parts/errors.unknown_entity.js',
    'src/parts/errors.unknown_provider.js',
    'src/parts/parser.js',
    'src/parts/providers.namespace.js',
    'src/parts/providers.base.js',
    'src/parts/providers.string.js',
    'src/parts/providers.file.js',
    'src/parts/providers.ajax.js',
    'src/parts/providers.links.js',
    'src/parts/pomo.js',
    'src/parts/iife-close.js'
];

gulp.task('build', function(){
    gulp.src(blocks,{'base':'src/parts'})
        .pipe(concat('pomo.js'))
        .pipe(gulp.dest('./src/dist'));
    gulp.src('src/dist/pomo.js')
        .pipe(uglify())
        .pipe(concat('pomo.min.js'))
        .pipe(gulp.dest('src/dist'));

    return;
});

// runs all tests for pomo
gulp.task('test', function(){
    return gulp.src('tests/pomo.js')
        .pipe(jasmine());
});

gulp.task('default', ['build','test']);