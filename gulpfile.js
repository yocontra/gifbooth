var gulp = require('gulp');
var lr = require('gulp-livereload');
var gif = require('gulp-if');
var lr = require('gulp-livereload');
var cached = require('gulp-cached');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var csso = require('gulp-csso');
var nib = require('nib');
var jeet = require('jeet');
var autoprefixer = require('autoprefixer-stylus');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var globs = {
  js: 'src/js/**/*.js',
  css: 'src/css/**/*.styl',
  static: ['src/**/*', '!src/css/**/*.styl', '!src/js/*.js']
};

rimraf.sync('./dist');
mkdirp.sync('./dist/video');
var server = require('./server').listen(9090);

var bundleCache = {};
var pkgCache = {};
var bundler = browserify('./src/js/script.js', {
  cache: bundleCache,
  packageCache: pkgCache,
  fullPaths: true,
  debug: true
});

gulp.task('watch', function(){
  gulp.watch(globs.css, ['css']);
  gulp.watch(globs.js, ['js']);
  gulp.watch(globs.static, ['static']);
});

gulp.task('static', function(){
  return gulp.src(globs.static)
    .pipe(cached('build'))
    .pipe(gif('*.js', uglify()))
    .pipe(gif('*.css', csso()))
    .pipe(gulp.dest('dist'))
    .pipe(lr());
});

gulp.task('js', function(){
  return bundler.bundle()
    // browserify -> gulp transfer
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(cached('js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('dist/js/maps'))
    .pipe(gulp.dest('dist/js'))
    .pipe(lr());
});

gulp.task('css', function(){
  return gulp.src('src/css/**/*.styl')
    .pipe(cached('css'))
    .pipe(stylus({
      use:[
        nib(),
        jeet(),
        autoprefixer()
      ]
    }))
    .pipe(csso())
    .pipe(gulp.dest('dist/css'))
    .pipe(lr());
});

gulp.task('default', ['css', 'js', 'static', 'watch']);