'use strict';

/*
  super simplified hook system
  to create a hook:

      import hooks from '../../jsx/hooks';
      hooks.call()
 */

var _events = {};

class Hook {
  constructor() {
    this.handlers = new Set;
  }

  on(handler) {
    return this.handlers.add(handler);
  }

  off(handler) {
    return this.handlers.delete(handler);
  }

  call(...args) {
    for (let handler of this.handlers) {
      handler.apply(null, args);
    }
  }
}

export default {
  get: name => _events[name] || (_events[name] = new Hook),
};
