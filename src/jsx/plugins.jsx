'use strict';

import test from '../plugins/test/plugin';
import prefs from '../plugins/prefs/plugin';
import readnext from '../plugins/readnext/plugin';
import juicyvotes from '../plugins/juicy-votes/plugin';
import livecomments from '../plugins/live-comments/plugin';

var pluginClasses = [
  test,
  prefs,
  readnext,
  juicyvotes,
  livecomments,
];

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
