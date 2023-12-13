const gulp = require('gulp');
const clean = require('gulp-clean'); // Clean file

function clear() {
	return gulp
		.src('./build/', { read: false })
		.pipe(clean())
};


exports.clear = clear;