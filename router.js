
var util = require('util'),
  events = require('events');

module.exports = Router;


// CLI dispatcher
function Router(routes, app) {
  if(!app) app = routes, routes = {};
  if(!app) throw new Error('Router needs an app!');

  this.app = app;
  this.argv = app.argv.remain || [];
  this.handlers = [];
  this.bindRoutes(app.routes || routes);
  events.EventEmitter.call(this);
}

util.inherits(Router, events.EventEmitter);

Router.prototype.start = function(fn) {
  var self = this;
  if(!fn) fn = function(e) {
    if(e) return self.emit('error', e);
    self.emit('end');
  }

  var argv = this.argv || [],
    route = argv.join(' '),
    routes = this.gets(route);

  if(!routes.length) {
    this.app.emit('404', route);
    this.app.emit('notfound', route);

    this.emit('404', route);
    this.emit('notfound', route);
    return this;
  }

  routes.forEach(function(router) {
    self.emit('route:' + router.name, router);
    self.emit('route', router);
  });

  (function next(router) {
    if(!router) return fn();
    var args = route.match(router.route);
    router.handler.apply(self.app, args.slice(1).concat(function(e) {
      if(e) return fn(e);
      next(routes.shift());
    }));
  })(routes.shift());
};

Router.prototype.cmd = function(name, route, fn) {
  var r = Object.prototype.toString.call(route) == '[object RegExp]';
  route = r ? route : this.routeToRegex(route);
  this.handlers.push({ name: name, route: route, handler: fn });
};

Router.prototype.routeToRegex = function(route) {
  return new RegExp('^' + route + '$');
};

Router.prototype.gets = function(route) {
  return this.handlers.filter(function(handler) {
    return handler.route.test(route);
  });
};

Router.prototype.get = function(route) {
  return this.gets(route)[0];
};

Router.prototype.has = function(route) {
  return !!this.get(route);
};

Router.prototype.bindRoutes = function(routes, app) {
  routes = routes || (routes = {});

  var keys = Object.keys(routes),
    self = this;

  app = app || this.app;
  keys.forEach(function(route) {
    // the action handler.
    var action = routes[route];

    // the callback to execute on match
    var fn = app.commands[action] || function notfound(next) { next(); };
    self.cmd(action, route, fn);
  });
}

