"use strict";

import gulp from "gulp";
import path from "path";
import clean from "gulp-rimraf";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";
import nodemon from 'gulp-nodemon';
import plumber from "gulp-plumber";
import child_process from 'child_process';

gulp.task("default", ["copy", "watch", "nodemon"]);
gulp.task("production", ["build"]);
gulp.task("batch", ["copy", "run-batch"]);

let dirs = {
    src: "src/",
    serverScript: "build/index.js",
    batchScript: "build/batch.js",
    dest: "build/",
};

gulp.task('clean', () => {
	return gulp.src(dirs.dest, {read: "false"})
    .pipe(clean());
});

gulp.task("copy", ["js", "frontend", "index"]);


gulp.task("index", () => {
    return gulp.src(path.join(dirs.src, "frontend/index.html"))
                   .pipe(gulp.dest(path.join(dirs.dest, "frontend")));
})

gulp.task("frontend", () => {
    return gulp.src(path.join(dirs.src, "frontend/build/**/*"))
                   .pipe(gulp.dest(path.join(dirs.dest, "frontend/build")));
})

gulp.task("build", ["js-production", "frontend", "index"]);

gulp.task("run-batch", function(cb){
    var proc = child_process.spawn("node", [dirs.batchScript]);
    
    proc.stdout.on('data', function (data) {
      console.log('> ' + data);
    });

    proc.stderr.on('data', function (data) {
      console.log('err > ' + data);
    });

    proc.on('exit', function (code) {
      console.log('exit code: ' + code);
      cb(code);
    });
});

gulp.task("js", () => {
    return gulp.src([path.join(dirs.src, "**/*.js"), "!src/frontend/**/*"], {base: dirs.src})
    .pipe(plumber())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dirs.dest))
});

gulp.task("js-production", () => {
    return gulp.src([path.join(dirs.src, "**/*.js"), "!src/frontend/**/*"], {base: dirs.src})
    .pipe(babel())
    .pipe(gulp.dest(dirs.dest))
});

gulp.task("watch", () => {
    gulp.watch([path.join(dirs.src, "**/*.js"), "!src/frontend/**/*"], ["js"]);
});

gulp.task("nodemon", ["copy"], cb => {
        var started = false;

        nodemon({
                script: dirs.serverScript,
                ext: "js",
                ignore: [path.join(dirs.src, "**/*"), path.join(dirs.dest, "resources/**/*"), "gulpfile.babel.js"],
                env: {'NODE_ENV': 'development'},
        }).on("start", () => {
            if(!started) {
                cb();
                started = true;
            }
        });
});
