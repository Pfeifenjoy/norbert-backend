"use strict";

import gulp from "gulp";
import path from "path";
import clean from "gulp-rimraf";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";
import nodemon from 'gulp-nodemon';
import plumber from "gulp-plumber";

gulp.task("default", ["copy", "watch", "nodemon"]);
gulp.task("production", ["build"]);

let dirs = {
    src: "src/",
    serverScript: "build/index.js",
    dest: "build/",
};

gulp.task('clean', () => {
	return gulp.src(dirs.dest, {read: "false"})
    .pipe(clean());
});

gulp.task("copy", ["js"]);
gulp.task("build", ["js-production"]);


gulp.task("js", () => {
    return gulp.src([path.join(dirs.src, "**/*.js")], {base: dirs.src})
    .pipe(plumber())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dirs.dest))
});

gulp.task("js-production", () => {
    return gulp.src(path.join(dirs.src, "**/*.js"))
    .pipe(babel())
    .pipe(gulp.dest(dirs.dest));
});



gulp.task("watch", () => {
    gulp.watch(path.join(dirs.src, "**/*.js"), ["js"]);
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
