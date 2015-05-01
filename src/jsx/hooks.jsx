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

const hooks = {
  get: name => _events[name] || (_events[name] = new Hook),

  init(plugin) {
    let pluginHooks = _toHook.get(plugin.constructor);
    if (pluginHooks) {
      pluginHooks.forEach((hook) => {
        let [hookName, methodName] = hook;
        hooks.get(hookName).on((...args) => plugin[methodName](...args));
      });
    }
  }
}

export default hooks;

const _toHook = new Map();

export function hook(name) {
  return function(target, key, descriptor) {
    let targetClass = target.constructor;

    if (!_toHook.has(targetClass)) {
      _toHook.set(targetClass, []);
    }

    let targetHooks = _toHook.get(targetClass);
    targetHooks.push([name, key]);
  }
}
