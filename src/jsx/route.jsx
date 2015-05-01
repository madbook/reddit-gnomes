
import context from './context';

let routes = new Map();

export function router(plugin) {
  let targetRoutes = routes.get(plugin.constructor);
  if (targetRoutes) {
    targetRoutes.forEach((route) => plugin[route]());
  }
}

export function route(routeDefinition) {
  if (!routeDefinition) {
    return;
  }

  return function(target, key, descriptor) {
    for (let key in routeDefinition) {
      let val = routeDefinition[key];
      if (context[key] !== val) {
        return;
      }
    }

    let targetClass = target.constructor;

    if (!routes.has(targetClass)) {
      routes.set(targetClass, []);
    }

    let targetRoutes = routes.get(targetClass);
    targetRoutes.push(key);
  }
}
