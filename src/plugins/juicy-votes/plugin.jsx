!function() {
  'use strict';

  window.initPlugin(
    'juicy-votes',
    'adds juicy animations to vote arrows.  that\'s right. juicy.',
    plugin);
  
  function plugin(context) {
    $('.arrow').on('click', function() {
      var $this = $(this);

      if ($this.hasClass('upmod') || $this.hasClass('downmod')) {
        $this.addClass('reddit-prototype-juicy-ui-pulse');
      } else if ($this.hasClass('up') || $this.hasClass('down')) {
        $this.removeClass('reddit-prototype-juicy-ui-pulse');
      }
    });
  }
}();
