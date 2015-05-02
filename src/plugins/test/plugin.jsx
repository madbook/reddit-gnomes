'use strict';

import Plugin from '../../jsx/plugin';
import { hook } from '../../jsx/hooks';
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

  // will only get called when the 'init-prefs' hook fires
  @hook('init-prefs')
  setupExtraPrefs(descriptor) {
    descriptor[this.name].push({
      property: 'testing',
      displayName: 'Testing',
      description: 'nothing to see here',
    });
  }

  // will get called on all pages
  @route
  testForGnomeClass() {
    let gnomeClassFound = $('html').hasClass('gnome-test');
    console.log(template(gnomeClassFound));
  }

  @route({ page: 'prefs' })
  testRouting() {
    console.log('this should only happen on the prefs page!');
  }

  @route({ subdomain: 'm' })
  testMobile() {
    console.log('this should only happen on the mobile website!');
  }
}
