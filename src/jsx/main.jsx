'use strict';

import polyfill from './polyfill';
import { getPluginsList } from './plugins';
import store from './store';
import { toCssClassName } from './utils';

var plugins = getPluginsList();

// purge old settings, save new
store.state = {};
plugins.forEach(plugin => {
  plugin.setup();
  store.set(plugin.name, plugin.state)
});
var activePlugins = plugins.filter(plugin => plugin.shouldRun());
var pluginClassNames = activePlugins.map(plugin => {
  if (plugin.meta.cssClassName) {
    return 'gnome-' + plugin.meta.cssClassName;
  } else {
    var pluginBaseName = plugin.name.replace('Plugin', '');
    return 'gnome-' + toCssClassName(pluginBaseName);
  }
});

$(function() {
  $('html').addClass(pluginClassNames.join(' '));
  activePlugins.forEach(plugin => plugin.run());
});
