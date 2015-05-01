
import Plugin from '../../jsx/plugin';
import { route } from '../../jsx/route';

import { ThemeSwitcher } from './views';

export default class ThemeSwitcherPlugin extends Plugin {
  displayName = 'Theme Switcher';
  description = 'adds a form to the multi sidebar for dynamically switching themes';

  @route
  initThemeSwitcher() {
    let $sideBar = $('.listing-chooser');
    let hidden = false;
    
    if (!$sideBar.length) {
      hidden = true;
    }

    let mount = $.parseHTML('<div id="gnome-theme-switcher-mount"></div>')[0];
    
    if (hidden) {
      $('body').append(mount);
    } else {
      $sideBar.append(mount);
    }
    React.render(<ThemeSwitcher hidden={hidden} />, mount);
  }
}

