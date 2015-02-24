'use strict';

import { toCssClassName } from '../../jsx/utils';


class GnomePrefInput extends React.Component {
  constructor(props) {
    super(props);
    var val = this.props.plugin.state[this.props.property] || false;
    this.state = { val };

    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    var { name, description } = this.props;
    var cssName = toCssClassName(name);

    return <div className={'gnome-pref gnome-pref-for-' + cssName}>
      <input ref="checkbox" type="checkbox" name={cssName} checked={this.state.val} onClick={this.handleClick} />
      <label for={cssName}>{name}</label>
      &nbsp;
      <span className="little gray">({description || ''})</span>
    </div>;
  }

  handleClick() {
    var val = !this.state.val;
    var { plugin, property } = this.props;

    plugin.set(property, val);
    this.setState({ val });
  }
}


export class GnomePrefs extends React.Component {
  render() {
    var descriptor = this.props.descriptor;
    var prefs = this.props.plugins.map(plugin => {
      var prefs = descriptor[plugin.name].map(pref => {
        return <GnomePrefInput plugin={plugin}
                               property={pref.property}
                               name={pref.displayName}
                               description={pref.description} />;
      });

      return <div className="gnome-pref-group">{prefs}</div>;
    });

    return <div className="gnome-prefs-panel">{prefs}</div>;
  }
}


export var preftableTemplate = `<table class="preftable pretty-form gnome-prefs-table">
  <tr>
    <th>gnome options</th>
    <td class="prefright">
    </td>
  </tr>
</table>`;
