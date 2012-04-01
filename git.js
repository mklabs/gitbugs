
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  events = require('events'),
  spawn = require('child_process').spawn;

module.exports = Git;

// Git commands wrapper
function Git(cmd, o, cb) {
  if(this === global) return new Git(cmd, args, cb);
  if(!cb) cb = o, o = {};

  o = this.options = o || {};
  // o.over redirects child stdout/stderr to current process
  o.over = o.over || false;
  o.args = o.args || [];
  o.opts = o.opts || {};

  this.cwd = o.cwd || process.cwd();
  this.repo = path.join(this.cwd, '.gitbugs');

  events.EventEmitter.call(this);

  // if we're given a command, trigger this.
  if(cmd) this.cmd(cmd, o.args, o.opts);

  // on command exit, pass control over cb if passed in.
  if(cb) this.on('error', cb).once('end', function(command, code, stdout, stderr) {
    if(!code) return cb(null, stdout, stderr);
    var er = new Error('Got error - ' + command + '. Code:' + code);
    er.stdout = stdout;
    er.stderr = stderr;
    cb(er, stdout, stderr);
  });

  // check a few things.
  // should be called from within a git repo
  if(!path.existsSync(path.resolve(this.cwd, '.git'))) {
    this.emit('error', new Error(this.cwd + ' is not a git repo.'));
  }
}

util.inherits(Git, events.EventEmitter);

Git.prototype.cmd = function cmd(command, args, over, cb) {
  var self = this,
    stdout = [],
    stderr = [];

  var git = spawn('git', [command].concat(args), { cwd: this.repo });

  if(!cb && typeof over === 'function') cb = over, over = false;
  if(over || o.over) {
    git.stdout.pipe(process.stdout);
    git.stderr.pipe(process.stderr);
  }

  git.stdout.on('data', function(chunk) { stdout = stdout.concat(chunk); });
  git.stderr.on('data', function(chunk) { stderr = stderr.concat(chunk); });

  git.on('exit', function(code) {
    var er = code ? new Error('git ' + command + ' - Code: ' + code) : null;
    if(er) er.code = code;

    stdout = stdout.join(' ');
    stderr = stderr.join(' ');

    if(cb) cb(er, stdout, stderr);
    else if(er) self.emit('error', err, stderr);

    self.emit('end:' + command, er, stdout, stderr);
    self.emit('end', command, er, stdout, stderr);
  });
};

Git.prototype.init = function init(dirname, cb) {
  this.cmd('init', [dirname], true, cb);
};

Git.prototype.add = function add(files, cb) {
  if(!cb) cb = files, files = '.';
  files = Array.isArray(files) ? files : [files];
  this.cmd('add', files, true, cb);
};

Git.prototype.commit = function commit(message, o, cb) {
  if(!cb) cb = o, o = {};
  if(!cb) cb = message, message = '';

  // todo: if no message should prompt
  if(!message) cb(new Error('should provide a message'));

  var args = ['-m', message];
  if(o.add) args.push('-a');
  this.cmd('commit', args, true, cb);
};

Git.prototype.mv = function mv(args, cb) {
  if(!cb) cb = args, args = [];
  if(!args.length) cb(new Error('should provide arguments with git mv'));
  this.cmd('mv', args, true, cb);
};

Git.prototype.clone = function clone() {};

