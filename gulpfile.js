var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('default', function () {
    return browserify('./src/app.js')
        .bundle()
        .pipe(source('app.min.js'))
        .pipe(gulp.dest('./dist/'));
});
