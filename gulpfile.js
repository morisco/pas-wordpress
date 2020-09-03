var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');

gulp.task('production', gulp.series(gulp.parallel(sassgz, jsgz, vendorgz)));

gulp.task('watch', gulp.series(gulp.parallel(sss, js, vendor, watchTask)));

function watchTask(){
    gulp.watch('./src/scss/*.scss', sss);
    gulp.watch('./src/js/*.js',js);
    gulp.watch('./src/vendor/js/*.js', vendor);
}

function sassgz() {
  return (
    gulp.src([
      './src/scss/_vars.scss',
      './src/scss/_mixins.scss',
      './src/scss/*.scss',
    ])        
    .pipe(concat('all.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gzip())

    .pipe(gulp.dest('./theme/dist/css'))
);
}


function sss() {
  return (
    gulp.src([
      './src/scss/_vars.scss',
      './src/scss/_mixins.scss',
      './src/scss/*.scss',
    ])
    .pipe(concat('all.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./theme/dist/css'))
  );
}

function jsgz() {
    return (
      gulp.src([
        './src/js/*.js'
      ])
      .pipe(concat('all.js'))
      .pipe(uglify({ mangle: false }))
      .pipe(gzip())
      .pipe(gulp.dest('./theme/dist/js'))
    );
}

function js() {
    return(
      gulp.src([
        './src/js/*.js'
      ])
      .pipe(concat('all.js'))
      // .pipe(uglify())
      .pipe(gulp.dest('./theme/dist/js'))
    )
}

function vendor() {
    return(
      gulp.src([
        './src/vendor/js/*.js'
      ])
      .pipe(concat('vendor.js'))
      .pipe(uglify({mangle: true}))
      .pipe(gulp.dest('./theme/dist/vendor'))
    )
}

function vendorgz() {
    return(
    gulp.src([
      './src/vendor/js/*.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(uglify({mangle: true}))
    .pipe(gzip())
    .pipe(gulp.dest('./theme/dist/vendor'))
    );
}
