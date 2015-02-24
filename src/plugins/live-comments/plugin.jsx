'use strict';

import Plugin from '../../jsx/plugin';
import Location from '../../jsx/location';

import Comment from './comment';


export default class LiveCommentsPlugin extends Plugin {
  run() {
    $(function() {
      var $discussionLinks = $('#discussions > div > p > a');

      if (!$discussionLinks.length) { return; }

      var topDiscussionLink = $discussionLinks[0];

      var path = Location.parseURL(topDiscussionLink.href).pathname + '.json?sort=new';

      $.get(path).then(function(res) {
        if (!res || res.length !== 2) { return; } 

        var comments = res[1].data.children.map(child => child.data);
        var $liveUpdates = $('.liveupdate-listing .liveupdate');

        var i = 0;
        var j = 0;

        var getCommentTime = (comment => comment.created_utc * 1000);
        var getLiveUpdateTime = (liveUpdate => (new Date($(liveUpdate).find('time')[0].getAttribute('datetime'))).getTime());

        var commentTime = getCommentTime(comments[i]);
        var liveUpdateTime = getLiveUpdateTime($liveUpdates[j]);

        while (true) {
          if (commentTime >= liveUpdateTime) {
            // if the comment is newer than the liveUpdate
            // insert above and check the next comment
            $liveUpdates.eq(j).before(
              $.parseHTML(React.renderToStaticMarkup(<Comment {...comments[i]} discussionLink={topDiscussionLink.href} />))
            );
            i++;
            if (i < comments.length) {
              commentTime = getCommentTime(comments[i]);
            } else {
              break;
            }
          } else {
            // otherwise, do nothing and check the next liveupdate
            j++;
            if (j < $liveUpdates.length) {
              liveUpdateTime = getLiveUpdateTime($liveUpdates[j]);
            } else {
              break;
            }
          }
        };
      });
    });
  }
}

LiveCommentsPlugin.meta = {
  displayName: 'Live Comment Gnomes',
  description: `pulls comments into reddit live threads from related discussions`,
  cssClassName: 'live-comments',
};
