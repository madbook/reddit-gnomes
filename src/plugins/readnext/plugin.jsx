'use strict';

import context from '../../jsx/context';
import Plugin from '../../jsx/plugin';
import { hook } from '../../jsx/hooks';
import { route } from '../../jsx/route';

import ReadNext from './views';


export default class ReadNextPlugin extends Plugin {
  displayName = 'Read Next Gnome';
  description = 'adds a widget to the sidebar on comments page that suggests next posts';

  static defaultState = {
    lockToBottom: false,
  };

  @hook('init-prefs')
  initPrefs(descriptor) {
    descriptor[this.name].push({
      property: 'lockToBottom',
      displayName: 'Lock to Bottom',
      description: 'lock the widget in the bottom corner instead of the top',
    });
  }

  @route({ page: 'comments' })
  async initWidget() {
    let { subreddit, thing } = context;
    let fullname = `t3_${thing}`;
    let params = $.param({ count: '10', after: fullname });
    let requestPath = `/r/${subreddit}.json?${params}`;
    let mountNode = $.parseHTML(`<div class="reddit-read-next-mount"></div>`)[0];
    let $mountNode = $(mountNode);

    try {
      let jsonData = await $.get(requestPath);
      let postListData = jsonData.data.children.map(child => child.data);
      $('body > .content > .commentarea').append(mountNode);
      let position = this.state.lockToBottom ? 'bottom' : 'top';
      
      React.render(
        <ReadNext shouldComponentLock={(node) => false}
                  lockedToBottom={this.state.lockToBottom}
                  posts={postListData}
                  subreddit={subreddit}
                  position={position} />,
        mountNode
      );
    } catch (err) {
      console.warn(err);
    }
  }
}
