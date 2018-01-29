const gulp         = require('gulp'), 
    sass           = require('gulp-sass'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    cleanCSS       = require('gulp-clean-css'),
    rename         = require('gulp-rename'),
    autoprefixer   = require('gulp-autoprefixer'),
    notify         = require('gulp-notify'),
    es6uglify      = require('gulp-uglify-es').default,
    wrap           = require('gulp-wrapper'),
    handlebars     = require('gulp-handlebars');

gulp.task('js', ()=> {
  return gulp.src([
    'src/*/*.js', 'src/*/*/*.js'
  ])
    .pipe(es6uglify())
    .pipe(rename({dirname: 'js'}))
    .pipe(gulp.dest('out'));
});

gulp.task('bootstrap-js', ()=> {
  return gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
    //.pipe(es6uglify())
    .pipe(rename({dirname: 'js'}))
    .pipe(gulp.dest('out'));
});
/*
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
*/
gulp.task('sass', () => {
  return gulp.src(['src/*/*.sass', 'src/*/*.scss'])
    .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
    .pipe(rename({suffix: '.min', prefix : '', dirname: 'css'}))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(cleanCSS())
    .pipe(gulp.dest('out'));
});

gulp.task('html', () => {
  return gulp.src('src/popup/*.html')
    .pipe(gulp.dest('out'));
});

gulp.task('icon', () => {
  return gulp.src('src/content/img/*.png')
    .pipe(gulp.dest('out/img'));
});

gulp.task('copy-manifest', () => {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('out'));
});

gulp.task('handlebars', () => {
  return gulp.src(['src/*/*.handlebars', 'src/*/*/*.handlebars'])
    .pipe(handlebars())
    // precompile templates
    .pipe(wrap({
      header: (filename)=>{
        let name = filename.path.substr(filename.path.lastIndexOf('/') + 1, filename.path.length -filename.path.lastIndexOf('/') ).split('.');
        name.pop();
        return `templates['`+ name.join('.') + `'] = template(`
      },
      footer: `);`
    }))
    // merge templates
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
    // minify templates
    .pipe(uglify())
    .pipe(gulp.dest('out/js'))
});

// constant autobuild
gulp.task('watch', [
  'copy-manifest',
  'js',
  'sass',
  'html',
  'icon',
  //'inject',
  'bootstrap-js',
  'handlebars'
], () => {
  gulp.watch(['src/*/*.sass', 'src/*/*.scss'], ['sass']);
  gulp.watch('src/manifest.json', ['copy-manifest']);
  gulp.watch(['src/*/*.js', 'src/*/*/*.js'], ['js']);
  gulp.watch('src/popup/*.html', ['html']);
  gulp.watch('src/content/img/*.png', ['icon']);
  //gulp.watch('src/js/inject/*.js', ['inject']);
  gulp.watch('node_modules/bootstrap/dist/js/bootstrap.min.js', ['bootstrap-js']);
  gulp.watch(['src/*/*.handlebars', 'src/*/*/*.handlebars'], ['handlebars']);
});

// build extension
gulp.task('build', [
  'copy-manifest',
  'js',
  'sass',
  'html',
  'icon',
  //'inject',
  'bootstrap-js',
  'handlebars'
]);

gulp.task('default', ['watch']);
