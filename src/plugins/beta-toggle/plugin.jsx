'use strict';

import Plugin from '../../jsx/plugin';

import BetaToggle from './views';


export default class BetaTogglePlugin extends Plugin {
  run() {
    var isBeta = document.location.hostname.startsWith('beta.');
    var mountNode = $.parseHTML(`<div class="reddit-beta-toggle-mount"></div>`)[0];
    var $mountNode = $(mountNode);

    React.render(
      <BetaToggle isBeta={isBeta} />,
      mountNode
    );

    $('#sr-header-area .drop-choices').after(mountNode);
  }
}

BetaTogglePlugin.meta = {
  displayName: 'Beta Toggle Gnome',
  description: `toggle on and off beta mode. meep.`,
};
