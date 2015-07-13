var gulp = require('gulp'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    jslint = require('gulp-jslint'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

gulp.task('watch', function () {
    gulp.watch(['./src/*.js'], ['build']);
});

gulp.task('build', function () {
    return browserify('./src/app.js')
        .bundle()
        .pipe(source('app.min.js'))
        .pipe(buffer())
        // .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', function () {
    return gulp.src(['./src/*.js'])
        .pipe(jslint({}))
        .on('error', function (error) {
            console.error(String(error));
        });
});
