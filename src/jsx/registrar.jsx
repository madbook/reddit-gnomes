
/*
  general-purpose module for registering decorators on class methods that should
  be deferred until post-instantiation
 */

let registry = new Map()

function getInitializer(methodName, handler) {
  return (instance) => handler(instance, methodName);
}

export default {
  register(classObj, methodName, handler) {
    let classRegistry = registry.get(classObj);

    if (!classRegistry) {
      classRegistry = [];
      registry.set(classObj, classRegistry);
    }

    let methodInitializer = getInitializer(methodName, handler);
    classRegistry.push(methodInitializer)
  },

  initialize(instance) {
    let classRegistry = registry.get(instance.constructor);
    if (classRegistry) {
      classRegistry.forEach((initializer) => initializer(instance));
    }
  }
}
