'use strict';

import Plugin from '../../jsx/plugin';
import context from '../../jsx/context';
import Location from '../../jsx/location';
import { unsafe } from '../../jsx/utils';


var buttonTemplate = `<li>
  <a class="reddit-prototype-top-comment" href="#">[top comment]</a>
</li>`;

var commentTemplate = (body) => `<div class="reddit-prototype-top-comment-text md-container">
  ${body}
</div>`;


export default class TopCommentPlugin extends Plugin {
  shouldRun() {
    return super.shouldRun() && !context.page;
  }

  run() {
    var $things = $('#siteTable .thing');

    if (!$things.length) { return }

    var onFrontpage = !context.subreddit;

    $things.each(function() {
      var $this = $(this);
      // check the number of comments first
      var comments = parseInt($this.find('.comments').text().split(' ')[0], 10) | 0;

      if (!comments) { return; }

      $this.find('.buttons').append($.parseHTML(buttonTemplate));
    });

    $('#siteTable').on('click', 'a.reddit-prototype-top-comment', function(e) {
      e.preventDefault();

      var $this = $(this);
      var $parent = $this.closest('.thing');
      var fullname = $parent.data('fullname');
      var id = fullname.split('_')[1];
      var pathObj

      if (onFrontpage) {
        let parentURL = $parent.find('a.subreddit').attr('href');
        pathObj = Location.parseURL(parentURL);
      } else {
        pathObj = context;
      }

      this.requestComments(pathObj.pathname, id, body => {
        var node = $.parseHTML(commentTemplate(body));
        $parent.find('.entry').append(node);
        $this.remove();
      });
    });
  }

  requestComment(pathname, id, cb) {
    var params = $.param({
      limit: 1,
      sort: 'top',
    });
    var path = `${pathname}/comments/${id}.json\?${params}`;

    $.get(path).then(res => {
      var comment = res[1].data.children[0].data;
      var body = unsafe(comment.body_html);
      cb(body);
    });
  }
}

TopCommentPlugin.meta = {
  displayName: 'Top Comment Gnome',
  description: `adds a link to posts on listing pages to load the top comment inline`,
  cssClassName: 'top-comment',
};
