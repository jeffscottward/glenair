/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  babel = require('gulp-babel'),
  image = require('gulp-image'),
  browserSync = require('browser-sync');

/*
 * Directories here
 */
var paths = {
  public: './public/',

  css: './public/css/',
  js: './public/js/',
  img: './public/img/',

  sass: './src/sass/',
  es6: './src/js/',
  images: './src/images/',

  data: './src/_data/',
  partials: './src/_partials/',

  nodeMods: './node_modules/'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */
gulp.task('pug', () => {
  return gulp.src('./src/*.pug')
    .pipe(
      data((file) => {
        return require(
          paths.data +
          path.basename(file.path) +
          '.json');
    }))
    .pipe(pug())
    .on('error', (err) => {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest(paths.public));
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], () => {browserSync.reload();});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'pug', 'es6'], () => {
  browserSync({
    server: { baseDir: paths.public },
    open: false,
    notify: false
  });
});

/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', () => {
  return gulp.src(paths.sass + '**/**.scss')
    .pipe(
      sass({
        includePaths: [paths.sass],
        outputStyle: 'compressed'}))
    .on('error', sass.logError)
    .pipe(
      prefix(
        ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
        { cascade: true }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({stream: true}));
});

// Compile ES6 js files to ES2015 and copy over
gulp.task('es6', () => {
  return gulp.src(paths.es6 + '*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest(paths.js));
});

// Optimize and copy CSS over
gulp.task('image', () => {
  return gulp.src(paths.images + '*')
    .pipe(image())
    .pipe(gulp.dest(paths.img));
});

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
gulp.task('watch', () => {
  gulp.watch(paths.sass + '**/*.scss', ['sass']);
  gulp.watch('./src/**/*.pug', ['rebuild']);
  gulp.watch('./src/**/*.js', ['rebuild']);
});

// Build task compile sass and pug.
gulp.task('build', ['sass', 'pug', 'es6']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch']);
