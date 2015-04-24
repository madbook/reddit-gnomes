'use strict';

export default class BetaToggle extends React.Component {
  onChange() {
    var a = document.createElement('a');
    a.href = document.location.href;
    a.hostname = this.props.isBeta ? 'www.reddit.com' : 'beta.reddit.com';
    document.location = a.href;
  }

  render() {
    var classSet = React.addons.classSet({
      'beta-toggle': true,
      'active': this.props.isBeta,
    });

    return <div className={classSet}>
      <label>
        beta&nbsp;
        <input type="checkbox" checked={this.props.isBeta} onChange={this.onChange.bind(this)} />
      </label>
    </div>;
  }
}
