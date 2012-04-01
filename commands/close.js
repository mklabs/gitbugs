
var join = require('path').join;

// close a single or a set of issues
module.exports = function close(ids, cb) {
  var self = this,
    git = this.git;

  if(!cb) cb = ids, ids = '';
  ids = ids || '';
  ids = Array.isArray(ids) ? ids : (ids + '').split(' ');

  // needs ids now, may prompt.
  if(!ids.length || !ids[0]) return cb(new Error('Missing id(s) with close command'));

  cb = this.cb('close', cb);
  // get each issue
  var issues = [],
    ln = ids.length;

  ids.forEach(function(id) {
    self.get(id, function(er, issue) {
      if(er) return cb(er);
      issues.push(issue);
      if(--ln) return;
      var args = issues.map(function(issue) { return issue.file; });
      git.mv(args.concat('closed/'), function(er) {
        if(er) return cb(er);
        var ids = issues.map(function(issue) {
          return issue.id;
        });

        git.commit('Close #' + ids.join(', '), { all: true }, cb);
      });
    });
  });

  this.last = 'close';
  return this;
};

