
import { unsafe } from '../../jsx/utils';

export class ThemeSwitcher extends React.Component {
  static defaultProps = {
    hidden: false,
  };

  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);

    let themeStyleElement = document.createElement('style');
    let savedTheme = localStorage.getItem('gnome-theme-switcher') || '';
    themeStyleElement.innerHTML = unsafe(savedTheme);

    let transitionAll = document.createElement('style');
    transitionAll.innerHTML = '* { transition: all !important }';

    this.state = {
      themeContainer: themeStyleElement,
      transitionAll:  transitionAll,
      appliedStylesheet: $('link[title="applied_subreddit_stylesheet"]')[0],
    }
  }

  componentWillMount() {
    document.head.appendChild(this.state.themeContainer);
    document.head.appendChild(this.state.transitionAll);
    if (this.state.appliedStylesheet) {
      document.head.removeChild(this.state.appliedStylesheet);
    }
  }

  componentWillUnmount() {
    document.head.removeChild(this.state.themeContainer);
    document.head.removeChild(this.state.transitionAll);
    if (this.state.appliedStylesheet) {
      document.head.appendChild(this.state.appliedStylesheet);
    }
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

    localStorage.setItem('gnome-theme-switcher', stylesheetText);
    this.state.themeContainer.innerHTML = unsafe(stylesheetText);
  }
}