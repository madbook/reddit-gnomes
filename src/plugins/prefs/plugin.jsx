!function() {
  'use strict';

  window.initPlugin(
    'prefs',
    'creates UI on the user preference page to enable and disable plugins',
    plugin);

  function plugin(context, store) {
    if (context.location.page !== 'prefs') { return; }

    var GnomePrefInput = React.createClass({
      getInitialState() {
        var val = this.props.val;
        return {val};
      },

      render() {
        return <div className={'gnome-pref-for-' + this.props.name}>
          <input ref="checkbox" type="checkbox" name={this.props.name} checked={this.state.val} onClick={this.handleClick} />
          <label for={this.props.name}>{this.props.name}</label>
          &nbsp;
          <span className="little gray">({this.props.description || ''})</span>
        </div>;
      },

      handleClick() {
        var key = this.props.name;
        var val = !this.state.val;
        store.set(`${key}/enabled`, val);
        this.setState({val});
      },
    });

    var GnomePrefs = React.createClass({
      render() {
        var prefs = store.keys().map(function(key) {
          var {enabled, description} = store.state[key];

          return <GnomePrefInput key={key} 
                                 name={key}
                                 description={description}
                                 val={enabled} />
        });

        return <div className="gnome-prefs-panel">{prefs}</div>;
      }
    });

    var prefTable = $.parseHTML(`
      <table class="preftable pretty-form gnome-prefs-table">
        <tr>
          <th>gnome options</th>
          <td class="prefright">
          </td>
        </tr>
      </table>
    `);
    var mountNode = document.createElement('div');

    $(prefTable).find('.prefright').append(mountNode);
    $('.content form').eq(0).after(prefTable);
    React.render(<GnomePrefs />, mountNode);
  }
}();
