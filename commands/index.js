
var fs = require('fs'),
  path = require('path');

var commands = module.exports;

fs.readdirSync(path.join(__dirname)).forEach(function(file) {
  var command = file.replace(path.extname(file), '');
  if(command === 'index' || path.extname(file) !== '.js') return;
  commands.__defineGetter__(command, function() {
    return require('./' + command);
  });
});
