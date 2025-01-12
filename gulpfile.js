const { src, dest, watch, parallel, series } = require('gulp')
const gulp = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const browserSync = require('browser-sync').create()
const autoprefixer = require('gulp-autoprefixer')
const clean = require('gulp-clean')
const newer = require('gulp-newer')
const svgSprite = require('gulp-svg-sprite')
// const avif = require('gulp-avif')
// const webp = require('gulp-webp')
// const imagemin = require('gulp-imagemin')
// const cached = require('gulp-cached')

function images() {
  // функция переносит все файлы изображений c указанными расширениями из папки src в папку dist
  return src('app/images/src/**/*.{jpg,png,svg,gif,ico,webp,avif}', {
    encoding: false,
  })
    .pipe(newer('app/images/dist'))
    .pipe(dest('app/images/dist'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ style: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function sprite() {
  return src('app/images/dist/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
            example: true,
          },
        },
      })
    )
    .pipe(dest('app/images/dist'))
}

function scripts() {
  return src(['node_modules/swiper/swiper-bundle.js', 'app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  })
  watch(['app/scss/style.scss'], styles)
  watch(['app/images/src'], images)
  watch(['app/js/main.js'], scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
  return src('dist').pipe(clean())
}

function building() {
  return src(
    [
      'app/css/style.min.css',
      'app/images/dist/*.*',
      'app/js/main.min.js',
      'app/**/*.html',
    ],
    {
      base: 'app',
    }
  ).pipe(dest('dist'))
}

exports.styles = styles
exports.images = images
exports.sprite = sprite
exports.scripts = scripts
exports.watching = watching

exports.build = series(cleanDist, building)
exports.default = parallel(styles, scripts, watching)
