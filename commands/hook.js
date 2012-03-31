
// enables post commit hook
module.exports = function hook(cb) {
  cb = this.cb('hook', cb);
  cb();
  return this;
};
