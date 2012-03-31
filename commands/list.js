
var fs = require('fs'),
  path = require('path');

// list all open issues
module.exports = function list(term, o, cb) {
  var self = this;
  if (typeof cb !== 'function') cb = o, o = null;
  if (typeof cb !== 'function') cb = term, term = null;
  if (typeof term !== 'string') o = term, term = null;
  term = term === null ? '' : term;
  cb = this.cb('list', cb);

  var dirname = this.path();
  if(/closed?/.test(term)) {
    dirname = this.path('closed');
    term = '';
  }

  term = new RegExp(term);
  fs.readdir(dirname, function(er, files){
    if(er) return cb(er);

    files = files.filter(function(file) {
      return path.extname(file) === '.md' && term.test(file);
    });

    var ln = files.length;
    if(!ln) return cb(null, []);

    var results = [];
    files.forEach(function(file) {
      fs.readFile(path.join(dirname, file), 'utf8', function(er, body) {
        if(er) return cb(er);
        var lines = body.split('\n'),
          heading = lines[0].split('-');

        results.push({
          body: body,
          id: heading[0].replace(/^[\#\s]+(\d+)\s+/, '#$1'),
          title: heading[1],
          file: file
        });

        if(--ln) return;
        self.table(o, results);
        cb(null, results);
      });
    });
  });

  return this;
};
