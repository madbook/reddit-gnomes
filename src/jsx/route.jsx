
import context from './context';
import Registrar from './registrar';


function getContextValidator(routeContext) {
  return function(target, key, descriptor) {
    for (let key in routeContext) {
      let val = routeContext[key];
      if (typeof val === 'boolean') {
        if (val ^ !!context[key]) {
          return false;
        }
      } else {
        if (context[key] !== val) {
          return false;
        }
      }
    }

    return true;
  }
}

function _route(target, key, descriptor) {
  let targetClass = target.constructor;
  Registrar.register(targetClass, key, _routeInitializer);
}

function _routeInitializer(instance, methodName) {
  instance[methodName]();
}

function getValidatedRoute(routeContext, validator) {
  return function(target, key, descriptor) {
    if (!validator(target, key, descriptor)) {
      return false;;
    } else {
      return _route(target, key, descriptor);
    }
  }
}

export function route(...args) {
  if (args.length === 1) {
    let routeContext = args[0];
    let routeValidator = getContextValidator(routeContext);
    return getValidatedRoute(routeContext, routeValidator);
  } else {
    return _route(...args);
  }
}
