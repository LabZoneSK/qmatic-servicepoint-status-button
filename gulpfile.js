const autoprefixer = require('gulp-autoprefixer');
const cache = require('gulp-cache');
const clean = require('gulp-clean');
const cssnano = require('gulp-cssnano');
const gulp = require('gulp');
const gutil = require('gulp-util');
const imagemin = require('gulp-imagemin');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const zip = require('gulp-zip');

gulp.task('clean', () => {
  return gulp.src('./build', {
      read: false
    })
    .pipe(clean());
});

gulp.task('copy', () => {
  gulp.src(['./src/*.html', './src/*.xml'])
    .pipe(gulp.dest('./build'));

  return gulp.src('./src/i18n/*.*')
    .pipe(gulp.dest('./build/i18n'));
});

gulp.task('images', function () {
  return gulp.src('./src/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('build/images'))
});

gulp.task('scripts', () => {
  gulp.src('./src/scripts/*.js')
    .pipe(gulp.dest('./build/scripts'))
});

gulp.task('styles', () => {
  gulp.src('./src/sass/*.scss')
    .pipe(sass({
      style: 'expanded'
    }))
    .on('error', gutil.log)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    /*.pipe(cssnano())*/
    .pipe(gulp.dest('./build/css'));
});

gulp.task('create-wgt', () => {
  gulp.src('build/*')
    .pipe(zip('staffButtonWidget.wgt'))
    .pipe(gulp.dest('widget'))
});

gulp.task('build', (cb) => {
  runSequence(
    'clean', ['copy', 'scripts', 'styles', 'images'],
    'create-wgt',
    cb
  )
});

gulp.task('watch-dev', () => {
  gulp.watch('./src/**', ['styles', 'copy', 'scripts']);
})