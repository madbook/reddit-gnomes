!function() {
  'use strict';

  window.initPlugin(
    'test', 
    'performs a console log and checks for the "gnome-test" css class on the html element.',
    plugin);
  
  function plugin(context, store) {
    console.log(
`--------
test init function has run!
the html element does ${$('html').hasClass('gnome-test') ? '' : 'not '}have the 'gnome-test' class.
--------`
    );
  }
}();
