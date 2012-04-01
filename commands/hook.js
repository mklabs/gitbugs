
var fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp');

// enables post commit hook
module.exports = function hook(cb) {
  cb = this.cb('hook', cb);
  var self = this;

  fs.readFile(path.join(__dirname, '../bin/commit-msg'), 'utf8', function(er, body) {
    if(er) return cb(er);
    body = body.replace(':modpath', path.join(__dirname, '../'));

    var git = path.join(path.dirname(self.path()), '.git');

    var hook = path.join(git, 'hooks/commit-msg');
    mkdirp(path.dirname(hook), function(er) {
      if(er) return cb(er);
      fs.writeFile(hook, body, function(er) {
        if(er) return cb(er);
        fs.chmod(hook, 0755, function(er) {
          if(er) return cb(er);
          console.log('Initialized post commit hook in ', hook);
          cb();
        });
      });
    });
  });

  this.last = 'hook';
  return this;
};
