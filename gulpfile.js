// package vars
const pkg = require("./package.json");

// gulp
const gulp = require("gulp");

// load all plugins in "devDependencies" into the variable $
const $ = require("gulp-load-plugins")({
    pattern: ["*"],
    scope: ["devDependencies"]
});

const onError = (err) => {
  console.log(err);
};


// Default task
gulp.task("m", ["css", "js"], () => {
  gulp.watch([pkg.paths.src.scss + '**/*.scss'], ["css"]);
  gulp.watch([pkg.paths.src.js + "**/*.js"], ["js"]);
  $.fancyLog('-- gulp ready --');
});

// scss - build the scss to the build folder, including the required paths, and writing out a sourcemap
gulp.task("scss", () => {
  return gulp.src(pkg.paths.src.scss + pkg.vars.scssName)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init({loadMaps: false}))
    .pipe($.sass({
        includePaths: pkg.paths.scss
      })
      .on("error", $.sass.logError))
    .pipe($.cached("sass_compile"))
    .pipe($.autoprefixer())
    .pipe($.print())
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.dist.css));
});

// css task - combine & minimize any distribution CSS into the public css folder
gulp.task("css", ["scss"], () => {
  return gulp.src(pkg.paths.dist.css)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.newer({dest: pkg.paths.dist.css + pkg.vars.cssName}))
    .pipe($.cssnano())
    .pipe(gulp.dest(pkg.paths.dist.css))
    .pipe($.filter("**/*.css"))
});

// js task - minimize any distribution Javascript into the public js folder, and add our banner to it
gulp.task("js", () => {
  return gulp.src(pkg.paths.src.js + pkg.vars.jsName)
      .pipe($.plumber({errorHandler: onError}))
      .pipe($.if(["*.js", "!*.min.js"],
          // Enable this line if you want your dist js files to be *.min.js
          // $.newer({dest: pkg.paths.dist.js, ext: ".min.js"}),
          $.newer({dest: pkg.paths.dist.js})
      ))
      .pipe($.babel({presets: ['es2015']}))
      // .pipe($.if(["*.js", "!*.min.js"],
      //     $.uglify()
      // ))
      // Enable this pipe if you want your dist js files to be *.min.js
      // .pipe($.if(["*.js", "!*.min.js"],
      //     $.rename({suffix: ".min"})
      // ))
      .pipe($.size({gzip: true, showFiles: true}))
      .pipe(gulp.dest(pkg.paths.dist.js))
      .pipe($.filter("**/*.js"))
});