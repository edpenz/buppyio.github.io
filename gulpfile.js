var fs = require('fs');
var path = require('path');
var gulp = require('gulp');

// Build environment checks.
var assert = require('assert');

assert.notEqual(process.env['GOPATH'], undefined, 'GOPATH must be set and contain github.com/buppyio/bpy');
// TODO Check for pandoc, or switch to pure node converter.

// HTML linkify, pandoc and mustache.
var mustache = require('mustache');

var pandoc = require('gulp-pandoc');
var insert = require('gulp-insert');

var categoriesPath = path.join(process.env['GOPATH'], './src/github.com/buppyio/bpy/doc/man/');
var partialsPath = './templates/';

var docCategories = (function () {
  // Custom category names means we can't just use folder structure.
  var categories = [
    { title: 'Commands', code: '1', docs: [] },
    { title: 'Internals', code: '5', docs: [] },
    { title: 'Misc', 'code': '7', docs: []
  }];

  for (var category of categories) {
    var categoryPath = path.join(categoriesPath, category.code);

    for (docFilename of fs.readdirSync(categoryPath)) {
      var extensionlessFilename = path.basename(docFilename, '.md');

      category.docs.push({
        title: extensionlessFilename.replace('bpy_', ''), // Remove common prefix.
        source: path.join(categoryPath, docFilename),
        url: '/man/' + category.code + '/' + extensionlessFilename
      });
    }
  }

  return categories;
})();

var templateContents = (function() {
  var partials = {};

  for (filename of fs.readdirSync(partialsPath)) {
    var templatePath = path.join(partialsPath, filename);
    partials[filename] = fs.readFileSync(templatePath, 'utf8');
  }

  return partials;
})();

function generateLinks(contents) {
  return contents.replace(/([a-z_]+)\(([0-9])\)/g, '[$1($2)](/man/$2/$1.html)');
}

function differOnlyByExtension(a, b) {
  return !path.relative(a.slice(0, a.lastIndexOf('.')), b.slice(0, b.lastIndexOf('.')));
}

function renderDocFromTemplate(contents, file) {
  // Need doc metadata like title, but gulp pipeline doesn't give it to us,
  // instead we need to look it up via the building file name.
  var docMetadata = docCategories
    .map((category) => category.docs).reduce((a,b) => a.concat(b))
    .find((doc) => differOnlyByExtension(file.path, doc.source));

  var templateParams = {
    doc: docMetadata,
    categories: docCategories,
    contents: contents
  };

  return mustache.render('{{>doc.html}}', templateParams, templateContents);
}

gulp.task('docs', function() {
  return docCategories.map((category) => {
    return gulp
      .src(path.join(categoriesPath, category.code, '*.md'))
      .pipe(insert.transform(generateLinks))
      .pipe(pandoc({from: 'markdown', to: 'html5', ext: '.html'}))
      .pipe(insert.transform(renderDocFromTemplate))
      .pipe(gulp.dest(path.join('./man/', category.code)));
  });
});

// CSS less, autoprefix and minify.
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

var cssSources = './less/*.less';
var cssOutputsDir = './css/';

gulp.task('css', function() {
  return gulp
    .src(cssSources)
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(cssOutputsDir));
});

// Copy library resources.
gulp.task('libs', function() {
  return [
    gulp.src('./node_modules/bootstrap/dist/fonts/*').pipe(gulp.dest('./fonts')),
    gulp.src('./node_modules/bootstrap/dist/js/*').pipe(gulp.dest('./js')),
    gulp.src('./node_modules/jquery/dist/*').pipe(gulp.dest('./js'))
  ];
});

// Helpers.
gulp.task('default', ['docs', 'css', 'libs']);

gulp.task('watch', function(){
  gulp.watch(path.join(categoriesPath, '**/*.md'), ['docs']);
  gulp.watch(path.join(partialsPath, '**/*'), ['docs']);

  gulp.watch(cssSources, ['css']);
});
