'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import rimraf from 'rimraf';
import sherpa from 'style-sherpa';
import yaml from 'js-yaml';
import fs from 'fs';
import excelsheets2json from 'gulp-excelsheets2json';
import ext_replace from 'gulp-ext-replace';
import router from 'front-router';
import ngHtml2Js from 'gulp-ng-html2js';
// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
    gulp.series(clean, gulp.parallel(index, pages, sass, javascript,templates, angular,jslib, images, copy, ex2json)));

// Build the site, run the server, and watch for file changes
gulp.task('default',
    gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
    return gulp.src(PATHS.assets)
        .pipe(gulp.dest(PATHS.dist + '/assets'));
}

function ex2json() {
    return gulp.src(PATHS.xlsx)
        .pipe(excelsheets2json({
            dest: PATHS.dist + '/assets/data'
        }))
        //.pipe(ext_replace('.json'))
        //.pipe(gulp.dest(PATHS.dist + '/assets/data'))
}

// Copy page templates into finished HTML files
function pages(done) {
    gulp.src('./src/templates/**/*.html')
        .pipe(router({
            path: './dist/assets/js/routes.js',
            root: 'src'
        }))
        .pipe(gulp.dest(PATHS.dist + '/templates'))
    done();
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
    panini.refresh();
    done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function index() {
       return gulp.src('./src/index.html')
        .pipe(gulp.dest(PATHS.dist))
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
                includePaths: PATHS.sass
            })
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: COMPATIBILITY
        }))
        // Comment in the pipe below to run UnCSS in production
        //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
        .pipe($.if(PRODUCTION, $.cssnano()))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/css'))
        .pipe(browser.reload({ stream: true }));
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
    return gulp.src('src/assets/js/*.js')
        //.pipe($.sourcemaps.init())
        //.pipe($.babel())
        //.pipe($.concat('appfou.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        //.pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

function jslib() {
    return gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('appfou.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

function angular() {
    return gulp.src(PATHS.foundationJS)
        .pipe($.concat('foundation.js'))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}
function templates(done) {
    gulp.src('bower_components/foundation-apps/js/angular/components/**/*.html')
        .pipe(ngHtml2Js({
            prefix: 'components/',
            moduleName: 'foundation',
            declareModule: false
        }))
        .pipe($.uglify())
        .pipe($.concat('templates.js'))
       .pipe(gulp.dest(PATHS.dist + '/assets/js'));


    // Iconic SVG icons
    gulp.src('./bower_components/foundation-apps/iconic/**/*')
        .pipe(gulp.dest(PATHS.dist + '/assets/img/iconic/'));
  done();
}




// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src('src/assets/img/**/*')
        .pipe($.if(PRODUCTION, $.imagemin({
            progressive: true
        })))
        .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
    browser.init({
        server: PATHS.dist,
        port: PORT
    });
    done();
}

// Reload the browser with BrowserSync
function reload(done) {
    browser.reload();
    done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    gulp.watch(PATHS.assets, copy);
    gulp.watch('src/templates/**/*.html').on('change', gulp.series(pages, browser.reload));
    gulp.watch('src/index.html').on('change', gulp.series(index, browser.reload));
    gulp.watch('src/assets/scss/**/*.scss', sass);
    gulp.watch('src/assets/js/**/*.js').on('change', gulp.series(javascript, browser.reload));
    gulp.watch('src/assets/img/**/*').on('change', gulp.series(images, browser.reload));
    gulp.watch('src/assets/data/*.xls').on('change', gulp.series(ex2json, browser.reload));
    // gulp.watch('src/styleguide/**').on('change', gulp.series(styleGuide, browser.reload));
}
