
var fs = require('fs');

module.exports = function edit(id, cb) {
  var self = this;
  if(!cb) cb = id, id = null;

  // needs ids now, may prompt.
  if(!id) return cb(new Error('Missing id with edit command'));

  var editfile = self.path('.edit');
  this.get(id, function(er, issue) {
    if(er) return cb(er);
    var rs = fs.createReadStream(self.path(issue.file)),
      ws = fs.createWriteStream(editfile),
      chunks = '';

    rs.on('data', function(chunk) { chunks += chunk; });

    rs.pipe(ws).on('close', function() {
      self.editor(function(er, body) {
        if(er) return cb(er);
        if(er) return cb(er);
        if(chunks === body) return;

        var match = (body.match(/#([\d]+)\s\-\s*(.+)\s*$/m) || []);
          id = match[1],
          title = match[2];

        if(!id) return cb(new Error('Invalid ID'));
        if(!title) return cb(new Error('Invalid title'));

        var actions = id !== issue.id ? [move, message] : [message];
        if(id !== issue.id || title !== issue.title) return move(self.prompt, function(er, res) {
          if(er) return cb(er);
          if(res.move === 'n') return cb();

          var renamed = id + '-' + self.slug(title) + '.md';
          message(self.prompt, function(er, res) {
            if(er) return cb(er);
            self.git.mv([issue.file, renamed], function(er) {
              if(er) return cb(er);
              fs.writeFile(self.path(renamed), body, function(er) {
                if(er) return cb(er);
                self.git.add(renamed, function(er) {
                  if(er) return cb(er);
                  self.git.commit(res.msg, cb);
                });
              });
            });
          });
        });

        message(self.prompt, function(er, res) {
          if(er) return cb(er);
          var filepath = self.path(issue.file);
          fs.writeFile(filepath, body, function(er) {
            if(er) return cb(er);
            self.git.add(issue.file, function(er) {
              if(er) return cb(er);
              self.git.commit(res.msg, cb);
            });
          });
          self.git.add(self.path(issue.file), function(er) {
            if(er) return cb(er);
            self.git.commit(res.msg, cb);
          });
        });


      })
    });
  });
};

function message(prompt, msg, cb) {
  if(!cb) cb = msg, msg = 'Commit message: ';
  prompt({prompt: msg, name: 'msg', required: true}, cb);
}

function move(prompt, msg, cb) {
  if(!cb) cb = msg, msg = 'Rename: [Y]es/[N]o ';

  var prompts = { prompt: msg, name: 'move', default: 'Y', required: true };
  prompt(prompts, function(er, res) {
    if(er) return cb(er);
    var yes = /^y$/i.test(res.move),
      no = /^n$/i.test(res.move);

    if(!yes && !no) return move(prompt, cb);
    cb(null, { move: yes ? 'y' : 'n' });
  });
}


