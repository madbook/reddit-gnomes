'use strict';

import pluginClasses from './plugin-loader';

var plugins = {
  map: {},
  list: [],
};

pluginClasses.forEach(GnomePlugin => {
  if (GnomePlugin instanceof Function) {
    var { displayName } = GnomePlugin;
    var plugin = new GnomePlugin();

    plugins.map[displayName] = plugin;
    plugins.list.push(plugin);
  } else {
    throw "plugin must be a function";
  }
});

export function getPluginsList() {
  return plugins.list;
};

export function getPlugins() {
  return plugins.map;
};
