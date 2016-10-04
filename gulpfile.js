var gulp = require('gulp');
var spawn = require('child_process').spawn;
var plugins = require('gulp-load-plugins')();

process.stdin.setRawMode(true);

gulp.task('clean', function () {
  return gulp.src('build', {read: false})
          .pipe(plugins.clean());
});

gulp.task('cloudformation', ['clean'], function(){
  var swagger = require('fs').readFileSync(__dirname + '/etc/swagger.yaml').toString('utf-8');
  var parts = swagger.split(/@@([A-Za-z]+)/g).map(function (part, index){
    if (index % 2 === 0) {
      return JSON.stringify(part);
    } else {
      return '{ "Fn::GetAtt" : ["' + part + '", "Arn"] }';
    }
  });

  return gulp.src(['etc/cloudformation.json'])
    .pipe(plugins.replace(/@@swagger/g, function (match, part) {
      return '{ "Fn::Join": ["", [ ' + parts.join(', ') + ' ]] }';
    }))
    .pipe(gulp.dest('build'));
});

/**
 * Update lambda function
 **/
gulp.task('updateCopy', ['clean'], function () {
  return gulp.src('src/update/**/*')
    .pipe(plugins.copy('build', { prefix: 1 }));
});

gulp.task('updateLibCopy', ['updateCopy'], function () {
  return gulp.src('src/lib/**/*')
    .pipe(plugins.copy('build/update', { prefix: 1 }));
});

gulp.task('updateInstall', ['updateCopy', 'updateLibCopy'], function () {
  return gulp.src('build/update/*')
    .pipe(gulp.dest('build/update/'))
    .pipe(plugins.install());
});

gulp.task('updateZip', ['updateInstall'], function () {
  return gulp.src('build/update/**/*')
    .pipe(plugins.zip('update.zip'))
    .pipe(gulp.dest('build'));
});

/**
 * Document lambda function
 **/
gulp.task('documentCopy', ['clean'], function () {
  return gulp.src('src/document/**/*')
    .pipe(plugins.copy('build', { prefix: 1 }));
});

gulp.task('documentLibCopy', ['documentCopy'], function () {
  return gulp.src('src/lib/**/*')
    .pipe(plugins.copy('build/document', { prefix: 1 }));
});

gulp.task('documentInstall', ['documentCopy', 'documentLibCopy'], function () {
  return gulp.src('build/document/*')
    .pipe(gulp.dest('build/document/'))
    .pipe(plugins.install());
});

gulp.task('documentZip', ['documentInstall'], function () {
  return gulp.src('build/document/**/*')
    .pipe(plugins.zip('document.zip'))
    .pipe(gulp.dest('build'));
});

/**
 * History lambda function
 **/
gulp.task('historyCopy', ['clean'], function () {
  return gulp.src('src/history/**/*')
    .pipe(plugins.copy('build', { prefix: 1 }));
});

gulp.task('historyLibCopy', ['historyCopy'], function () {
  return gulp.src('src/lib/**/*')
    .pipe(plugins.copy('build/history', { prefix: 1 }));
});

gulp.task('historyInstall', ['historyCopy', 'historyLibCopy'], function () {
  return gulp.src('build/history/*')
    .pipe(gulp.dest('build/history/'))
    .pipe(plugins.install());
});

gulp.task('historyZip', ['historyInstall'], function () {
  return gulp.src('build/history/**/*')
    .pipe(plugins.zip('history.zip'))
    .pipe(gulp.dest('build'));
});

gulp.task('runDevelopment', function (done) {
  console.log('\n---\nPress any key to exit\n---\n');

  var api = spawn('node', ['server.js', '../../etc/swagger.yaml'], {
    cwd: 'node_modules/api-gateway-server'
  });
  api.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  api.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  process.stdin.on('data', function () {
    process.stdin.pause();
    api.kill('SIGKILL');
    done();
  });
});

gulp.task('build', ['clean', 'cloudformation', 'buildDocment', 'buildUpdate', 'buildHistory']);
gulp.task('buildDocment', ['documentCopy', 'documentLibCopy', 'documentInstall', 'documentZip']);
gulp.task('buildHistory', ['historyCopy', 'historyLibCopy', 'historyInstall', 'historyZip']);
gulp.task('buildUpdate', ['updateCopy', 'updateLibCopy', 'updateInstall', 'updateZip']);


gulp.task('default', ['run']);
