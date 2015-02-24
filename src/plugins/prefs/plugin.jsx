'use strict';

import Plugin from '../../jsx/plugin';
import context from '../../jsx/context';
import { getPluginsList } from '../../jsx/plugins';
import hooks from '../../jsx/hooks';

import { GnomePrefs, preftableTemplate }  from './views';


export default class PrefsPlugin extends Plugin {
  shouldRun() {
    return context.page === 'prefs';
  }

  run() {
    var prefTable = $.parseHTML(preftableTemplate);
    var mountNode = document.createElement('div');
    var plugins = getPluginsList();
    var descriptor = this.buildDescriptor(plugins);;

    hooks.get('init-prefs').call(descriptor);

    $(prefTable).find('.prefright').append(mountNode);
    $('.content form').eq(0).after(prefTable);
    React.render(<GnomePrefs plugins={plugins}
                             descriptor={descriptor} />, mountNode);
  }

  buildDescriptor(plugins) {
    var descriptor = {};
    
    plugins.forEach(plugin => {
      var { displayName, description } = plugin.meta;
      
      descriptor[plugin.name] = [{
        property: 'enabled',
        displayName: displayName,
        description: description,
      }];
    });

    return descriptor;
  }
}

PrefsPlugin.meta = {
  displayName: 'Gnome Preferences',
  description: `creates UI on the user preference page to enable and 
disable plugins`,
};
