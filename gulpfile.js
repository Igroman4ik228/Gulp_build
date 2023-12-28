const { src, dest, watch, series, parallel } = require('gulp')

// HTML
const fileInclude = require('gulp-file-include'); // Include file HTML
const htmlmin = require('gulp-htmlmin'); // HTML minify without changing
const webpHTML = require('gulp-webp-html-nosvg'); // Converting images to WebP format in HTML
const typograf = require('gulp-typograf'); // Orthography correction

// SASS
const sass = require('gulp-sass')(require('sass')); // Сompilation Sass/Scss
const sassGlob = require('gulp-sass-glob'); // Global imports
const sourceMaps = require('gulp-sourcemaps'); // Source map in CSS
const autoprefixer = require('gulp-autoprefixer'); // Adds prefixes in CSS to support older browsers
const cleanCSS = require('gulp-clean-css'); // Clean CSS

// IMG
const imagemin = require('gulp-imagemin'); // image compression
const webp = require('gulp-webp'); // The ability сonvert images to WebP format

// JS
const webpack = require('webpack-stream'); // Module JS
const babel = require('gulp-babel'); // Support for older browsers for javascript compatibility

// Other
const browserSync = require('browser-sync').create(); // Live server
const changed = require('gulp-changed'); // Checking for changes
const plumber = require('gulp-plumber'); // Watch Error
const notify = require('gulp-notify'); // Notify Error
const gulpif = require('gulp-if') // Easy "if" in gulp
const clean = require('gulp-clean'); // Clean file
const zip = require('gulp-zip') // Archive files
const fs = require('fs'); // File system 


// Production
let isProd = false; // dev by default


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

const imageminOption = [
	imagemin.gifsicle({ interlaced: true }),
	imagemin.mozjpeg({ quality: 85, progressive: true }),
	imagemin.optipng({ optimizationLevel: 2 })
]


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
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(typograf({ locale: ['ru', 'en-US'] }))
		.pipe(gulpif(isProd, webpHTML()))
		.pipe(gulpif(isProd, htmlmin(htmlminOption)))
		.pipe(dest(gulpif(isProd, './docs/', './build/')))
		.pipe(browserSync.stream());
};

function scss() {
	return src('./src/scss/*.scss')
		.pipe(changed(gulpif(isProd, './docs/css/', './build/css/')))
		.pipe(sourceMaps.init())
		.pipe(gulpif(isProd, autoprefixer()))
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(gulpif(isProd, cleanCSS({ level: 2 })))
		.pipe(sourceMaps.write())
		.pipe(dest(gulpif(isProd, './docs/css/', './build/css/')))
		.pipe(browserSync.stream());
};

function images() {
	return src(['./src/img/**/*', '!./src/img/favicons/'])
		.pipe(changed(gulpif(isProd, './docs/img/', './build/img/')))
		.pipe(gulpif(isProd, webp()))
		.pipe(dest(gulpif(isProd, './docs/img/', './build/img/')))
		.pipe(gulpif(isProd, src(['./src/img/**/*', '!./src/img/favicons/*'])))
		.pipe(gulpif(isProd, changed('./docs/img/')))
		.pipe(gulpif(isProd, imagemin(imageminOption, { verbose: true })))
		.pipe(gulpif(isProd, dest('./docs/img/')));
};

function favicons() {
	return src('./src/img/favicons/')
		.pipe(changed(gulpif(isProd, './docs/img/', './build/img/')))
		.pipe(dest(gulpif(isProd, './docs/img/', './build/img/')))
};

function fonts() {
	return src('./src/fonts/**/*')
		.pipe(changed(gulpif(isProd, './docs/fonts/', './build/fonts/')))
		.pipe(dest(gulpif(isProd, './docs/fonts/', './build/fonts/')))
		.pipe(browserSync.stream());
};

function files() {
	return src('./src/files/**/*')
		.pipe(changed(gulpif(isProd, './docs/files/', './build/files/')))
		.pipe(dest(gulpif(isProd, './docs/files/', './build/files/')));
};

function robots() {
	return src('./src/robots.txt')
		.pipe(changed(gulpif(isProd, './docs/', './build/')))
		.pipe(dest(gulpif(isProd, './docs/', './build/')));
};

function js() {
	return src('./src/js/*.js')
		.pipe(changed(gulpif(isProd, './docs/js/', './build/js/')))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(gulpif(isProd, babel()))
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(dest(gulpif(isProd, './docs/js/', './build/js/')))
		.pipe(browserSync.stream());
};

function watchFiles() {
	browserSync.init({
		server: {
			baseDir: isProd ? './docs/' : './build/'
		},
	});
	if (!isProd) {
		watch('./src/scss/**/*.scss', parallel(scss));
		watch('./src/html/**/*.html', parallel(html));
		watch('./src/img/**/*', parallel(images));
		watch('./src/fonts/**/*', parallel(fonts));
		watch('./src/files/**/*', parallel(files));
		watch('./src/js/**/*.js', parallel(js));
	}
};

function zipArchive() {
	return src(['./*', '!./node_modules', '!./build', '!./docs', '!./package-lock.json', '!./archive.zip', '!./pnpm-lock.yaml'])
		.pipe(plumber(plumberNotify('zipArchive')))
		.pipe(zip('archive.zip'))
		.pipe(dest('./'));
};


function zipDocs() {
	return src('./docs/**/*.*')
		.pipe(plumber(plumberNotify('zipDocs')))
		.pipe(zip('docs.zip'))
		.pipe(dest('./'));
};


function toProd(done) {
	isProd = true;
	done();
};

exports.default = series(clear, parallel(html, scss, images, favicons, fonts, files, robots, js), watchFiles);

exports.docs = series(toProd, clear, parallel(html, scss, images, favicons, fonts, files, robots, js), watchFiles);

exports.zip = series(zipArchive);

exports.zipdocs = series(zipDocs);
