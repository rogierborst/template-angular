var _ = require('underscore');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
var compass = require('gulp-compass');
var factor = require('factor-bundle');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var path = require('path');
var reload = browserSync.reload;
var source = require('vinyl-source-stream');
var sourceMaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

// MAIN TASKS
gulp.task('serve', ['sass', 'browserify'], function(){
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        reloadOnRestart: false
    });

    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', ['html']);
});

gulp.task('default', ['serve']);

// JAVASCRIPT
gulp.task('browserify', function(){
    // Directories
    var src = './app/js/';
    var dist = './dist/js/';

    // Files to bundle as separate modules
    var files = ['main'];
    var entryFiles = files.map(function(file){
        return src + file + '.js';
    });
    var outputFiles = files.map(function(file){
        return dist + file + '.js';
    });

    // Bundle arguments
    var browserifyArgs = {
        // needed by watchify
        cache: {}, packageCache: {}, fullPaths: true,
        // browserify args
        entries: entryFiles,
        debug: true,
        insertGlobals: true
    };

    var b = browserify(browserifyArgs);
    var bundler = watchify(b);
    var bundle = function(){
        return bundler
            .plugin(factor, {o: outputFiles})
            .bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('common.js'))
            .pipe(gulp.dest(dist))
            .pipe(reload({stream: true}))
        ;
    };

    bundler.on('update', bundle);

    return bundle();
});

// ANGULAR TEMPLATES
gulp.task('html', function(){
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(reload({stream: true}));
});

// STYLESHEETS
var taskSass = function(){
    gulp.src('./app/sass/**/*.scss')
        .pipe(compass({
            config_file: path.join(process.cwd(), 'config.rb'),
            //project: path.join(process.cwd(), '/app'),
            css: './dist/css',
            sass: './app/sass',
            sourcemap: true,
            import_path: './',
            image: 'img'
        }))
        .on('error', function(err){
            console.error('Error!', err.message);
            this.emit('end');
        })
        .pipe(gulp.dest('tmp'))
        .pipe(reload({stream: true}));
}

gulp.task('sass', taskSass);
