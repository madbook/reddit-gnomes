
import { unsafe } from '../../jsx/utils';

export class ThemeSwitcher extends React.Component {
  static defaultProps = {
    hidden: false,
  };

  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);

    let themeStyleElement = document.createElement('style');
    let savedTheme = this.loadTheme();
    let transitionAll = document.createElement('style');
    transitionAll.innerHTML = '* { transition: all !important }';
    this.transitionAll = transitionAll;
    this.themeContainer = themeStyleElement;
    this.appliedStylesheet = $('link[title="applied_subreddit_stylesheet"]')[0];
    this._themeApplied = false;
    this.applyTheme(savedTheme);
  }

  applyTheme(stylesheetText) {
    if (stylesheetText) {
      this.themeContainer.innerHTML = unsafe(stylesheetText);
    }

    if (!this._themeApplied && stylesheetText) {
      document.head.appendChild(this.themeContainer);
      document.head.appendChild(this.transitionAll);
      if (this.appliedStylesheet) {
        document.head.removeChild(this.appliedStylesheet);
      }
      this._themeApplied = true;
    } else if (this._themeApplied && !stylesheetText) {
      document.head.removeChild(this.themeContainer);
      document.head.removeChild(this.transitionAll);
      if (this.appliedStylesheet) {
        document.head.appendChild(this.appliedStylesheet);
      }
      this._themeApplied = false;
    }
  }

  saveTheme(stylesheetText) {
    localStorage.setItem('gnome-theme-switcher', stylesheetText);
  }

  loadTheme() {
    return localStorage.getItem('gnome-theme-switcher') || '';
  }

  render() {
    return <form className="gnome-theme-switcher" hidden={this.props.hidden}
                 onSubmit={this.onSubmit}>
      <input type="text" ref="name" placeholder="subreddit" />
    </form>;
  }

  async onSubmit(e) {
    e.preventDefault();
    let node = React.findDOMNode(this.refs.name);
    let subredditName = node.value;
    let stylesheetText = '';

    try {
      let jsonResponse = await $.getJSON(`/r/${subredditName}/about/stylesheet.json`);
      stylesheetText = jsonResponse.data.stylesheet;
      let images = jsonResponse.data.images;

      if (images) {
        for (let image of images) {
          let { name, url } = image;
          let reName = new RegExp(`%%${name}%%`, 'g');
          stylesheetText = stylesheetText.replace(reName, `"${url}"`);
        }
      }
    } catch (err) {
      console.warn(`error retrieving stylesheet for /r/${subredditName}`);
    }

    this.applyTheme(stylesheetText);
    this.saveTheme(stylesheetText);
  }
}