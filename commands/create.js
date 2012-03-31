
var fs = require('fs');

// create a new issue
module.exports = function create(message, cb) {
  var self = this;
  if(!cb) cb = message, message = '';
  cb = this.cb('create', cb);

  var prompts = [{
    prompt: '» Enter a title for this issue: ',
    name: 'title',
    default: message || '',
    required: true
  }, {
    prompt: '\nLeave blank to write this in your text editor\n» Enter a description: ',
    name: 'desc',
    default: ''
  }];

  this.prompt(prompts, function(er, inputs) {
    if(er) return cb(er);
    var title = inputs.title,
      message = inputs.desc,
      tags = inputs.tags;

    self.commands.list.call(self, { silent: true }, function(er, files) {
      if(er) return cb(er);

      var id = files.length + 1;
      if(message) return next(id, title, message, cb);

      if(!message) return this.editor(function(er, body) {
        if(er) return cb(er);
        next(id, title, body, cb);
      });

      function next(id, title, message, cb) {
        if(!cb) cb = message, message = '';
        message = message || title;

        var slug = self.slug(title),
          filename = id + '-' + slug + '.md',
          filepath = self.path(filename);

        var content = [
          '## #'+ id + ' - '  + title,
          '',
          message
        ].join('\n');

        fs.writeFile(filepath, content, function(er) {
          if(er) return cb(er);
          self.git.add(filename, function(er) {
            if(er) return cb(er);
            self.git.commit(message, cb);
          });
        });
      }
    });
  });

  this.last = 'create';
  return this;
};

