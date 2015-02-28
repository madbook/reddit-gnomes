'use strict';

import context from '../../jsx/context';
import Plugin from '../../jsx/plugin';
import hooks from '../../jsx/hooks';

import ReadNext from './views';


export default class ReadNextPlugin extends Plugin {
  static get defaultState() {
    return {
      lockToBottom: false,
    };
  }

  shouldRun() {
    return super.shouldRun() && context.page === 'comments';
  }

  setup() {
    hooks.get('init-prefs').on(descriptor => {
      descriptor[this.name].push({
        property: 'lockToBottom',
        displayName: 'Lock to Bottom',
        description: 'lock the widget in the bottom corner instead of the top',
      });
    });
  }

  run() {
    var {subreddit, thing} = context;
    var fullname = `t3_${thing}`;
    var params = $.param({
      count: '10',
      after: fullname,
    });
    var requestPath = `/r/${subreddit}.json?${params}`;
    var mountNode = $.parseHTML(`<div class="reddit-read-next-mount"></div>`)[0];
    var $mountNode = $(mountNode);

    var { lockToBottom } = this.state;

    function shouldComponentLock(widgetNode) {
      var scrollPosition = window.scrollY;
      var nodePosition = $mountNode.position().top;

      if (lockToBottom) {
        let scrollOffset = window.innerHeight;
        let nodeOffset = $(widgetNode).height();

        scrollPosition += scrollOffset;
        nodePosition += nodeOffset;
      }

      return scrollPosition >= nodePosition;
    }

    $.get(requestPath).then(res => {
      var postListData = res.data.children.map(child => child.data);
      $('body > .side').append(mountNode);
      var position = this.state.lockToBottom ? 'bottom' : 'top';
      React.render(
        <ReadNext shouldComponentLock={shouldComponentLock}
                  lockedToBottom={lockToBottom}
                  posts={postListData}
                  subreddit={subreddit}
                  position={position} />,
        mountNode
      );
    });
  }
}

ReadNextPlugin.meta = {
  displayName: 'Read Next Gnome',
  description: `adds a widget to the sidebar on comments page that suggests
next posts`,
};
