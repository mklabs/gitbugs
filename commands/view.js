
module.exports = function view(id, cb) {
  var self = this;
  if(!cb) cb = id, id = null;

  // needs ids now, may prompt.
  if(!id) return cb(new Error('Missing id with view command'));

  this.get(id, function(er, issue) {
    if(er) return cb(er);
    var data = [];
    data.push([issue.id, issue.title, issue.status]);
    self.table({
      head: ['id', 'title', 'status']
    }, data);

    console.log(issue.content);
    cb();
  });
};


