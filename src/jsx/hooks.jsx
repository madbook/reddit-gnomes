'use strict';

import Registrar from './registrar';

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

const hooks = {
  get: name => _events[name] || (_events[name] = new Hook),

  register(hookName, instance, methodName) {
    hooks.get(hookName).on((...args) => instance[methodName](...args));
  },
}

export default hooks;

export function hook(name) {
  return function(target, key, descriptor) {
    let targetClass = target.constructor;
    let hookInitializer = getHookInitializer(name);
    Registrar.register(targetClass, key, hookInitializer);
  }
}

function getHookInitializer(name) {
  return (instance, methodName) => hooks.register(name, instance, methodName);
}
