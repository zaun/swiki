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
  return gulp.src('src/lambda/update/**/*')
    .pipe(plugins.copy('build', { prefix: 2 }));
});

gulp.task('updateLibCopy', ['updateCopy'], function () {
  return gulp.src('src/lambda/lib/**/*')
    .pipe(plugins.copy('build/update', { prefix: 2 }));
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
  return gulp.src('src/lambda/document/**/*')
    .pipe(plugins.copy('build', { prefix: 2 }));
});

gulp.task('documentLibCopy', ['documentCopy'], function () {
  return gulp.src('src/lambda/lib/**/*')
    .pipe(plugins.copy('build/document', { prefix: 2 }));
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
  return gulp.src('src/lambda/history/**/*')
    .pipe(plugins.copy('build', { prefix: 2 }));
});

gulp.task('historyLibCopy', ['historyCopy'], function () {
  return gulp.src('src/lambda/lib/**/*')
    .pipe(plugins.copy('build/history', { prefix: 2 }));
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

/**
 * Client build
 **/
gulp.task('clientBower', ['clean'], function () {
  return plugins.bower({
    cwd: 'src/client',
    directory: '../../build/bower'
  });
});

gulp.task('clientCopy', ['clientBower'], function () {
  return gulp.src([
      'build/bower/es6-promise/es6-promise.min.js',
      'build/bower/fetch/fetch.js',
      'build/bower/lodash/dist/lodash.min.js',
      'build/bower/riot/riot.min.js',
      'build/bower/riot-ui/dist/riot-ui.js'
    ])
    .pipe(plugins.copy('build/client/js', { prefix: 4 }));
});

gulp.task('clientJade', ['clean'], function () {
  return gulp.src('src/client/jade/**/*')
    .pipe(plugins.pug({
      'API_URL': 'https://lf3p07bvm8.execute-api.us-west-2.amazonaws.com/swikiTesting/'
    }))
    .pipe(gulp.dest('build/client/'));
});

gulp.task('clientJavascript', ['clean'], function () {
  return gulp.src('src/client/javascript/**/*')
    .pipe(plugins.concat('swiki.js'))
    .pipe(gulp.dest('build/client/js/'));
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

gulp.task('build', ['clean', 'cloudformation', 'buildDocment', 'buildUpdate', 'buildHistory', 'buildClient']);
gulp.task('buildClient', ['clientCopy', 'clientJade', 'clientJavascript']);
gulp.task('buildDocment', ['documentCopy', 'documentLibCopy', 'documentInstall', 'documentZip']);
gulp.task('buildHistory', ['historyCopy', 'historyLibCopy', 'historyInstall', 'historyZip']);
gulp.task('buildUpdate', ['updateCopy', 'updateLibCopy', 'updateInstall', 'updateZip']);


gulp.task('default', ['build']);
