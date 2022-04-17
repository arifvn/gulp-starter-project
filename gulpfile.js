const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const browsersync = require('browser-sync').create();

const sourcemaps = process.env.NODE_ENV === 'development';

// Html Task
function copyHtml() {
  return src('src/index.html').pipe(dest('dist'));
}

// Css Task
function cssTask() {
  return src('src/scss/main.scss', { sourcemaps })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist/css/', { sourcemaps: '.' }));
}

// Js Task
function jsTask() {
  return src('src/js/main.js', { sourcemaps })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist/js/', { sourcemaps: '.' }));
}

// Image Task
function imageTask() {
  return src('src/img/**/*', { sourcemaps })
    .pipe(imagemin().on('error', (error) => console.log(error)))
    .pipe(dest('dist/img/'));
}

// Browsersync
function browserInit(cb) {
  browsersync.init({
    server: {
      baseDir: './dist',
    },
    notify: {
      styles: {
        left: '0',
        right: '0',
        bottom: '0',
        top: 'auto',
        'border-radius': '0',
        opacity: '0.8',
        padding: '0.5rem',
        'background-color': '#66bb6a',
      },
    },
    open: false,
    port: 3000,
  });
  cb();
}
function browserReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch('src/*.html', series(copyHtml, browserReload));
  watch(['src/scss/**/*.scss'], series(cssTask, browserReload));
  watch(['src/js/**/*.js'], series(jsTask, browserReload));
  watch(['src/img/**/*'], series(imageTask, browserReload));
}

// Default Gulp Task
if (!sourcemaps) {
  // production
  exports.default = series(copyHtml, cssTask, jsTask, imageTask);
} else {
  // development
  exports.default = series(
    copyHtml,
    cssTask,
    jsTask,
    imageTask,
    browserInit,
    watchTask
  );
}
