const gulp           = require('gulp'),
		sass           = require('gulp-sass'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		notify         = require("gulp-notify"),
		es6uglify      = require('gulp-uglify-es').default,
		wrap           = require('gulp-wrapper'),
		handlebars     = require('gulp-handlebars');

 //manage background script
gulp.task('background-js', ()=> {
	return gulp.src([
		'src/js/background.js',
	])
		//.pipe(concat('background.min.js'))
		.pipe(es6uglify())

		.pipe(gulp.dest('out/js'));
});

gulp.task('js', ()=> {
	return gulp.src([
		'src/js/*.js',
	])
		.pipe(es6uglify())
		.pipe(gulp.dest('out/js'));
});

gulp.task('js-libs', ()=> {
	return gulp.src([
		'src/js/libs/*.js',
	])
		.pipe(gulp.dest('out/js'));
});

gulp.task('inject', () => {
	return gulp.src([
		'src/js/inject/*.js'
	])
		.pipe(rename((path)=>{
			path.basename = 'inject_'+path.basename;
		}))
		.pipe(es6uglify())
		.pipe(gulp.dest('out/js'))
});

gulp.task('sass', () => {
	return gulp.src(['src/sass/**/*.sass', 'src/sass/**/*.scss'])
		.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('out/css'));
});

gulp.task('html', () => {
	return gulp.src('src/html/*.html')
		.pipe(gulp.dest('out'));
});

gulp.task('icon', () => {
	return gulp.src('src/img/*.png')
		.pipe(gulp.dest('out/img'));
});

gulp.task('copy-manifest', () => {
	return gulp.src('src/manifest.json')
		.pipe(gulp.dest('out'));
});

gulp.task('handlebars', (el1) => {
	return gulp.src('src/handlebars/*.handlebars')
		.pipe(handlebars())
		// merge templates

		.pipe(wrap({
			header: (filename)=>{
				let name = filename.path.substr(filename.base.length, filename.path.length - filename.base.length).split('.');
				name.pop();
				return `templates['`+ name.join('.') + `'] = template(`
			},
			footer: `);`
		}))
		.pipe(concat('templates.js'))
		// Wrap for usage
		.pipe(wrap({
			header: (filename)=>{
				let name = filename.path.substr(filename.base.length, filename.path.length - filename.base.length).split('.');
				name.pop();
				return `(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
  `
			},
			footer: `
})();`
		}))
		.pipe(uglify())
		.pipe(gulp.dest('out/js'))
});

gulp.task('watch', [
	'copy-manifest',
	'js',
	'sass',
	'html',
	'icon',
	'inject',
	'js-libs',
	'handlebars'
], () => {
	gulp.watch(['src/sass/**/*.sass', 'src/sass/**/*.scss'], ['sass']);
	gulp.watch('src/manifest.json', ['copy-manifest']);
	gulp.watch('src/js/*.js', ['js']);
	gulp.watch('src/html/*.html', ['html']);
	gulp.watch('src/img/*.png', ['icon']);
	gulp.watch('src/js/inject/*.js', ['inject']);
	gulp.watch('src/js/libs/*.js', ['js-libs']);
	gulp.watch('src/handlebars/*.handlebars', ['handlebars']);
});

gulp.task('build', [
	'copy-manifest',
	'js',
	'sass',
	'html',
	'icon',
	'inject',
	'js-libs',
	'handlebars'
]);

gulp.task('default', ['watch']);
