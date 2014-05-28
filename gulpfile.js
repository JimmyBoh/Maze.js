var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cache = require('gulp-cache');
var connect = require('gulp-connect');

gulp.task('library', function () {
	return gulp.src('js/maze.js')
	.pipe(jshint('settings.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(gulp.dest('dist/'))
	.pipe(rename({
			suffix : '.min'
		}))
	.pipe(uglify())
	.pipe(gulp.dest('dist/'));
});

gulp.task('algorithms', function () {
	return gulp.src('js/algorithms/*.js')
	.pipe(jshint('settings.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(gulp.dest('dist/algorithms/'))
	.pipe(rename({
			suffix : '.min'
		}))
	.pipe(uglify())
	.pipe(gulp.dest('dist/algorithms'));
});

gulp.task('clean', function () {
	return gulp.src(['dist/'], {
		read : false
	})
	.pipe(clean());
});

gulp.task('watch', function () {

	// Watch .js files
	gulp.watch(['js/**/*.js', 'css/**/*.css'], function(){
		gulp.src(['index.html','js/**/*.js', 'css/**/*.css']).pipe(connect.reload());
	});

});

gulp.task('connect', function () {
	connect.server({
		port : 8080,
		livereload : true
	});
});

gulp.task('default', ['clean'], function () {
	gulp.start('library','algorithms', 'connect', 'watch');
});
