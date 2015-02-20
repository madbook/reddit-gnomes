!function() {
  'use strict';

  window.registerPlugin(TestPlugin);

  class TestPlugin {
    getMetadata() {
      return {
        name: 'test',
        description: `performs a console log and checks for the "gnome-test"
                      css class on the html element.`,
      };
    }

    run(context, store) {
      var gnomeClassFound = $('html').hasClass('gnome-test');
      console.log(
`--------
test init function has run!
the html element does ${gnomeClassFound ? '' : 'not '}have the 
'gnome-test' class.
--------`
      );
    }
  }
}();
