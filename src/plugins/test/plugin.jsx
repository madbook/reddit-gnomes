'use strict';

import Plugin from '../../jsx/plugin';
import hooks from '../../jsx/hooks';
import { route } from '../../jsx/route';


var template = (classFound) => `--------
test init function has run!
the html element does ${classFound ? '' : 'not '}have the 
'gnome-test' class.
--------`;

export default class TestPlugin extends Plugin {
  displayName = 'GnomeTest';
  description = 'checks for the existence of the gnome css class';
  
  static get defaultState() {
    return {
      testing: true,
    };
  }

  // will only get called on the prefs page
  @route({ page: 'prefs' })
  setupExtraPrefs() {
    hooks.get('init-prefs').on(descriptor => {
      descriptor[this.name].push({
        property: 'testing',
        displayName: 'Testing',
        description: 'nothing to see here',
      });
    });
  }

  // will get called on all pages
  @route
  testForGnomeClass() {
    let gnomeClassFound = $('html').hasClass('gnome-test');
    console.log(template(gnomeClassFound));
  }
}
