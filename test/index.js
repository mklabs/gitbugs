var fs = require('fs'),
  path = require('path'),
  nopt = require('nopt'),
  assert = require('assert'),
  GitBugs = require('../'),
  events = require('events');

var opts = nopt();
var gb = new GitBugs;
assert.ok(gb instanceof events.EventEmitter);
assert.ok(GitBugs() instanceof events.EventEmitter);

assert.equal(gb.path(), path.resolve('.gitbugs'));

// init
// gb.init(next('init', 'Reinitialized existing Git repository in /Users/mk/Temp/dev/mklabs/gitbugs/.gitbugs/.git/'));

gb.init(next('init', [
  /initialized\s(existing|empty)?\sGit\srepository\sin/i,
  'in /Users/mk/Temp/dev/mklabs/gitbugs/.gitbugs/.git/'
]));

gb.and(function() {

  // repo init go

  // hook - not implemented
  gb.hook(next('hook')).and(function() {
    console.log(' » Hook end', arguments);
  });

  // list
  gb.list().or(error('list with no issue opened', 'No opened issues.'));

  // create
  gb.create('This is a new issue', next('create a new issue', 'This is a new issue')).and(function() {
    gb.list(next('list with no args')).and(function(er, files) {
      assert.ifError(er);
      assert.equal(files.length, 1);
      assert.equal(files[0], '1-this-is-a-new-issue.md');
    });

    gb.list('new', next('list with "new" term')).and(function(er, files) {
      assert.ifError(er);
      assert.equal(files.length, 1);
      assert.equal(files[0], '1-this-is-a-new-issue.md');
    });

    gb.get(1, function(er, issue) {
      assert.ifError(er);
      assert.equal(issue.id, 1);
      assert.equal(issue.file, '1-this-is-a-new-issue.md');
      assert.equal(issue.content, '## #1 - This is a new issue\n\nThis is a new issue');
      assert.equal(issue.title,'This is a new issue');
    }).and(function(er, issue) {
      assert.ifError(er);
      assert.equal(issue.id, 1);
      assert.equal(issue.file, '1-this-is-a-new-issue.md');
      assert.equal(issue.content, '## #1 - This is a new issue\n\nThis is a new issue');
      assert.equal(issue.title,'This is a new issue');
    });

    gb.get(807987).or(error('get', 'No issue #807987'));

    // close - not implemented
    gb.close(1, error('close', 'not implemented'));
  });
});

// next handler, takes a topic, returns a function.
function next(topic, outputs) {
  if(!opts.debug) var to = setTimeout(function() { assert.fail(' ✗ Timeout Error: ', topic); }, 2000);
  outputs = Array.isArray(outputs) ? outputs : [outputs];
  return function(er, stdout, stderr) {
    assert.ifError(er);
    if(!opts.debug) clearTimeout(to);

    outputs.forEach(function(reg) {
      reg = typeof reg === 'string' ? new RegExp(reg) : reg;
      var msg = '\n Expected   - ' + reg + '.\n Was        - ' + stdout;
      if(reg) assert.ok(reg.test(stdout), msg);
    });

    console.log(' ✔ ' + topic + ' OK.');
  };
}

// same as next, but checks that the given error is passed
function error(topic, reg) {
  if(!opts.debug) var to = setTimeout(function() { assert.fail(' ✗ Timeout Error: ', topic); }, 2000);
  return function(er, stdout, stderr) {
    if(!opts.debug) clearTimeout(to);
    reg = typeof reg === 'string' ? new RegExp(reg) : reg;
    var msg = '\n Expected   - ' + reg + '.\n Was        - ' + er.stack;
    if(reg) assert.ok(reg.test(er.stack), msg);

    console.log(' ✔ ' + topic + ' OK.');
  };
}

