
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  read = require('read'),
  events = require('events'),
  mkdirp = require('mkdirp'),
  spawn = require('child_process').spawn,
  Table = require('cli-table'),
  Router = require('./router'),
  Git = require('./git'),
  commands = require('./commands');

module.exports = GitBugs;

function GitBugs(options, cb) {
  if(this === global) return new GitBugs(options, cb);
  var o = options || {};

  events.EventEmitter.call(this);

  // current working directory
  this.opts = o.opts || {};
  this.cwd = this.opts.cwd ? path.resolve(this.opts.cwd) : process.cwd();
  this.argv = o.argv || this.opts.argv;
  this.silent = this.opts.silent || false;

  if(cb) this.on('end', cb).on('error', cb);

  // init the git wrapper
  this.git = new Git;

  if(this.opts.help || !this.argv.remain[0]) return this.showHelp();
  if(this.opts.version) return console.log(require('./package.json').version);

  // if no argv passed, don't create cli router and dispacth
  if(!this.argv) return;

  this.commands = commands;
  this.router = new Router(this.routes, this);
  this.on('404', this.showHelp.bind(this));
  this.router.on('error', this.emit.bind(this, 'error'));
  if(o.start) this.start(cb);
}

util.inherits(GitBugs, events.EventEmitter);

GitBugs.prototype.routes = {
  'init'                : 'init',
  'hook'                : 'hook',
  'list'                : 'list',
  'create'              : 'create',
  'close'               : 'close',

  'list\\s?(closed?)?'  : 'list',
  'create\\s(.+)?'      : 'create',
  'new\\s(.+)?'         : 'create',
  'close\\s(.+)?'       : 'close',
  'ls\\s?(closed?)?'    : 'list',
  'll\\s?(closed?)?'    : 'list',
  'view\\s?([\\d]+)?'   : 'view',
  'info\\s?([\\d]+)?'   : 'view',
  'edit\\s?([\\d]+)?'   : 'edit',

  'new'                 : 'create'
};

// init the argv dispatch
GitBugs.prototype.start = function start(cb) {
  cb = this.cb(cb);
  var router = this.router;
  if(!router) return;
  var init = this.argv.remain[0] === 'init';
  fs.stat(this.path(), function(er) {
    if(er && !init) return cb(new Error('Unable to find `./gitbugs`, `gitbugs init` may help'));
    router.start(cb);
  });
};

GitBugs.prototype.showHelp = function showHelp() {
  fs.createReadStream(path.join(__dirname, 'bin/help.txt')).pipe(process.stdout);
};

// get a single issue
GitBugs.prototype.get = function get(id, cb) {
  var self = this;
  cb = self.cb('get', cb);

  var open = [],
    closed = [];

  // lookup in opened issues
  fs.readdir(this.path(), function(er, files) {
    if(er) return cb(er);
    if(!files.length) return next();

    files = files.filter(function(file) {
      var parts = file.split('-');
      return path.extname(file) === '.md' && parts[0] == id;
    });

    if(files.length) return next(null, files[0]);
    if(!self.opts.all) return cb(new Error('No issue #' + id));

    // lookup in closed issues if no match
    fs.readdir(self.path('closed'), function(er, files) {
      if(er) return cb(er);

      files = files.filter(function(file) {
        var parts = file.split('-');
        return path.extname(file) === '.md' && parts[0] == id;
      });

      if(!files.length) return cb(new Error('No issue #' + id));
      next(null, files[0], true);
    });
  });


  function next(er, file, closed) {
    if(er) return cb(er);
    fs.readFile(self.path(file), 'utf8', function(er, body) {
      if(er) return cb(er);
      var lines = body.split('\n'),
        title = (lines[0] || '').split('-')[1],
        body = lines.slice(1).join('\n');

      cb(null, {
        id: id,
        file: file,
        content: body,
        title: (title || '').trim(),
        status: closed ? 'close' : 'open'
      });
    });
  }

  this.last = 'get';
  return this;
};

// Creates a new cli table, displays the output and returns the cli
// table instance.
GitBugs.prototype.table = function(o, data) {
  var widths = [], total = 100;
  if(!data) data = o, o = {};
  o = o || {};
  o.head = o.head || ['Id', 'Title'];
  if(!o.colWidths) {
    o.head.forEach(function(col) {
      var width = /id/i.test(col) ? 10 :
        Math.floor(total / o.head.length);

      widths.push(width);
    });
    o.colWidths = widths;
  }

  var table = new Table(o);
  data.forEach(function(dt) {
    dt = Array.isArray(dt) ? dt : [dt.id, dt.title];
    table.push(dt);
  });

  if(!this.silent && !o.silent) console.log(table.toString());
  return table;
};

// resolves and join path under the `.gitbug` directory
GitBugs.prototype.path = function() {
  var args = Array.prototype.slice.call(arguments);
  return path.resolve.apply(path, [this.cwd, '.gitbugs'].concat(args));
};

// given a message, returns the accoding slug title
GitBugs.prototype.slug = function slug(message) {
  if(!message) return this.emit('error', new Error('No message'));
  return message.toLowerCase().replace(/[^\w]+/g, '-');
};

// wrapper to require('read'), prompting user for inputs
GitBugs.prototype.prompt = function prompt(prompts, cb) {
  prompts = Array.isArray(prompts) ? prompts : [prompts];
  var inputs = {};
  (function ask(prompt) {
    if(!prompt) return cb(null, inputs);
    read(prompt, function(er, val) {
      if(er) return cb(er);
      // reask if required and no value.
      if(!val && prompt.required) return ask(prompt);
      var name = prompt.name || prompt.prompt;
      inputs[name.toLowerCase()] = val;
      ask(prompts.shift());
    });
  })(prompts.shift());
};

// wrapper to spawn process, "taking over" to spawn configured editor
GitBugs.prototype.editor = function editor(file, cb) {
  if(!cb) cb = file, file = this.path('.edit');
  var editor = process.platform === 'win32' ? 'notepad' : 'vim';

  spawn(editor, [file], { customFds: [0, 1, 2]}).on('exit', function(code) {
    if(code) return cb(new Error('Editor exit code not 0 - ' + code));
    fs.readFile(file, 'utf8', function(er, body) {
      if(er) return cb(er);
      cb(null, body);
    });
  });
};

// default handler
GitBugs.prototype.cb = function(namespace, cb) {
  var self = this;
  this.last = namespace;
  if(!cb && typeof namespace === 'function') cb = namespace, namespace = '';
  namespace = namespace ? (':' + namespace) : '';
  return function(er) {
    var args = Array.prototype.slice.call(arguments);
    process.nextTick(function() {
      if(cb) cb.apply(self, args);
      if(!er) return self.emit.apply(self, ['end' + namespace].concat(args));
      self.emit('error' + namespace, er);
      self.emit('error', er);
    });
  };
};

// `and` helper. Takes a callback which gets called whenever the
// preceding command has completed.
GitBugs.prototype.and =
GitBugs.prototype.then =
GitBugs.prototype.success = function and(cb) {
  this.once('end:' + this.last, cb);
  return this;
};

GitBugs.prototype.or =
GitBugs.prototype.error = function error(cb) {
  this.once('error:' + this.last, cb);
  return this;
};
