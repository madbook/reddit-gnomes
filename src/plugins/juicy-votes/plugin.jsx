'use strict';

import Plugin from '../../jsx/plugin';


export default class JuicyVotesPlugin extends Plugin {
  run() {
    $('.arrow').on('click', function() {
      var $this = $(this);

      if ($this.hasClass('upmod') || $this.hasClass('downmod')) {
        $this.addClass('reddit-prototype-juicy-ui-pulse');
      } else if ($this.hasClass('up') || $this.hasClass('down')) {
        $this.removeClass('reddit-prototype-juicy-ui-pulse');
      }
    });
  }
}

JuicyVotesPlugin.meta = {
  displayName: 'Juicy Gnome Votes',
  description: `adds juicy animations to vote arrows. that's right. juicy.`,
  cssClassName: 'juicy-votes',
};
