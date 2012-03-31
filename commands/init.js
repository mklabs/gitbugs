
var mkdirp = require('mkdirp');

module.exports = function init(cb) {
  var repo = this.path(),
    dirname = this.path('closed'),
    git = this.git;

  mkdirp(dirname, function(er) {
    if(er) return cb(er);
    git.init(repo, cb);
  });

  this.last = 'init';
  return this;
};
