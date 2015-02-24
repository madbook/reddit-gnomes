'use strict';

import Plugin from '../../jsx/plugin';
import hooks from '../../jsx/hooks';

var template = (classFound) => `--------
test init function has run!
the html element does ${classFound ? '' : 'not '}have the 
'gnome-test' class.
--------`;



export default class TestPlugin extends Plugin {
  static get defaultState() {
    return {
      testing: true,
    };
  }

  setup() {
    hooks.get('init-prefs').on(descriptor => {
      descriptor[this.name].push({
        property: 'testing',
        displayName: 'Testing',
        description: 'nothing to see here',
      });
    });
  }

  run() {
    var gnomeClassFound = $('html').hasClass('gnome-test');
    console.log(template(gnomeClassFound));
  }
}

TestPlugin.meta = {
  displayName: 'Gnome Test',
  description: 'checks for the existence of the gnome css class',
}
