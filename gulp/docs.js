const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include'); //* Include file HTML
const htmlclean = require('gulp-htmlclean'); //* HTML minify without changing
const webpHTML = require('gulp-webp-html-nosvg'); //* Converting images to WebP format in HTML

// SASS
const sass = require('gulp-sass')(require('sass')); //* Сompilation Sass/Scss
const sassGlob = require('gulp-sass-glob'); //* Global imports
const autoprefixer = require('gulp-autoprefixer'); //* Adds prefixes in CSS to support older browsers
const webpCss = require('gulp-webp-css'); //* Converting images to WebP format in CSS

// Images
const imagemin = require('gulp-imagemin'); //* image compression
const webp = require('gulp-webp'); //* The ability сonvert images to WebP format

// Other
const server = require('gulp-server-livereload'); //* Load local server
const clean = require('gulp-clean'); // Clean file
const fs = require('fs'); // File system 
const sourceMaps = require('gulp-sourcemaps'); //* Source map in CSS
const groupMedia = require('gulp-group-css-media-queries'); //* Grouping media queries in CSS
const plumber = require('gulp-plumber'); //* Watch Error
const notify = require('gulp-notify'); //* Notify Error
const webpack = require('webpack-stream'); //* Module JS
const babel = require('gulp-babel'); //* Support for older browsers for javascript compatibility
const changed = require('gulp-changed'); // Checking for changes



// Tasks
gulp.task('clean:docs', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp
			.src('./docs/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html:docs', function () {
	return gulp
		.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
		.pipe(changed('./docs/'))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude({
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(webpHTML())
		.pipe(htmlclean())
		.pipe(gulp.dest('./docs/'));
});

gulp.task('sass:docs', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./docs/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(autoprefixer())
		.pipe(sassGlob())
		.pipe(webpCss())
		.pipe(groupMedia())
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./docs/css/'));
});

gulp.task('images:docs', function () {
	return gulp
		.src(['./src/img/**/*', '!./src/img/icons/*'])
		.pipe(changed('./docs/img/'))
		.pipe(webp())
		.pipe(gulp.dest('./docs/img/'))
		.pipe(gulp.src('./src/img/**/*'))
		.pipe(changed('./docs/img/'))
		.pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./docs/img/'));
});

// gulp.task('fonts:docs', function () {
// 	return gulp
// 		.src('./src/fonts/**/*')
// 		.pipe(changed('./docs/fonts/'))
// 		.pipe(gulp.dest('./docs/fonts/'));
// });

gulp.task('files:docs', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'));
});

gulp.task('js:docs', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(babel())
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'));
});


gulp.task('server:docs', function () {
	return gulp.src('./docs/').pipe(server({
		livereload: true,
		defaultFile: 'index.html',
		open: true,
	}));
});
