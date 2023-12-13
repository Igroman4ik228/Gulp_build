const { src, dest, watch, series, parallel } = require('gulp');

// HTML
const fileInclude = require('gulp-file-include'); // Include file HTML
const htmlmin = require('gulp-htmlmin'); // HTML minify without changing
const webpHTML = require('gulp-webp-html-nosvg'); // Converting images to WebP format in HTML
const typograf = require('gulp-typograf'); // Converting images to WebP format in HTML

// SASS
const sass = require('gulp-sass')(require('sass')); // Сompilation Sass/Scss
const sassGlob = require('gulp-sass-glob'); // Global imports
const autoprefixer = require('gulp-autoprefixer'); // Adds prefixes in CSS to support older browsers
const webpCss = require('gulp-webp-css'); // Converting images to WebP format in CSS

// IMG
const imagemin = require('gulp-imagemin'); // image compression
const webp = require('gulp-webp'); // The ability сonvert images to WebP format

// JS
const webpack = require('webpack-stream'); // Module JS
const babel = require('gulp-babel'); // Support for older browsers for javascript compatibility

// Other
const server = require('gulp-server-livereload'); // Load local server
const clean = require('gulp-clean'); // Clean file
const fs = require('fs'); // File system 
const sourceMaps = require('gulp-sourcemaps'); // Source map in CSS
const groupMedia = require('gulp-group-css-media-queries'); // Grouping media queries in CSS
const plumber = require('gulp-plumber'); // Watch Error
const notify = require('gulp-notify'); // Notify Error
const changed = require('gulp-changed'); // Checking for changes
const gulpif = require('gulp-if') // Easy "if" in gulp
const zip = require('gulp-zip') // Archive files

// Production
let isProd = false; // dev by default

// const isProd = process.argv.includes("--docs");
// const isDev = !isProd;

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

const htmlminOption = {
	collapseWhitespace: true,
	removeComments: true,
	removeAttributeQuotes: true,
	removeRedundantAttributes: true,
	removeEmptyAttributes: true,
	sortClassName: true,
	sortAttributes: true
}


//* Tasks
function clear(done) {
	if (fs.existsSync(gulpif(isProd, './docs/', './build/'))) {
		return src(gulpif(isProd, './docs/', './build/', { read: false }))
			.pipe(clean({ force: true }));
	}
	done()
};

function html() {
	return src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
		.pipe(changed((gulpif(isProd, './docs/', './build/'))))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude({
			prefix: '@',
			basepath: '@file',
		}))
		.pipe(typograf({ locale: ['ru', 'en-US'] }))
		.pipe(gulpif(isProd, webpHTML()))
		.pipe(gulpif(isProd, htmlmin(htmlminOption)))
		.pipe(dest(gulpif(isProd, './docs/', './build/')));
};

function scss() {
	return src('./src/scss/*.scss')
		.pipe(changed(gulpif(isProd, './docs/css/', './build/css/')))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(gulpif(isProd, autoprefixer({ cascade: false })))
		.pipe(sassGlob())
		.pipe(gulpif(isProd, webpCss()))
		.pipe(gulpif(isProd, groupMedia()))
		.pipe(sass(gulpif(isProd, { outputStyle: 'compressed' })))
		.pipe(sourceMaps.write())
		.pipe(dest(gulpif(isProd, './docs/css/', './build/css/')));
};

const imageminOption = [
	imagemin.gifsicle({ interlaced: true }),
	imagemin.mozjpeg({ quality: 85, progressive: true }),
	imagemin.optipng({ optimizationLevel: 2 })
]




function images() {
	return src(['./src/img/**/*'])
		.pipe(changed(gulpif(isProd, './docs/img/', './build/img/')))
		.pipe(gulpif(isProd, webp()))
		.pipe(dest(gulpif(isProd, './docs/img/', './build/img/')))

		.pipe(gulpif(isProd, src('./src/img/**/*')))
		.pipe(gulpif(isProd, changed('./docs/img/')))
		.pipe(gulpif(isProd, imagemin(imageminOption, { verbose: true })))
		.pipe(gulpif(isProd, dest('./docs/img/')));
};





function zipDocs() {
	return src('./docs/**/*.*')
		.pipe(plumber(plumberNotify('ZIP')))
		.pipe(zip('docs.zip'))
		.pipe(dest('./'));
};

function toProd(done) {
	isProd = true;
	done();
};
exports.default = series(clear, parallel(html, scss, images));

exports.docs = series(toProd, clear, parallel(html, scss, images));

exports.zip = series(zipDocs);

