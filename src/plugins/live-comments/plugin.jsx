!function() {
  'use strict';

  window.initPlugin(
    'live-comments',
    'pulls comments into reddit live threads from related discussions',
    plugin);

  function plugin(context, store) {
    var Comment = React.createClass({
      render() {
        return <li className="liveupdate">
          <a href="#">
            <time className="live-timestamp">some time ago</time>
          </a>
          <div className="body reddit-prototype-live-comment">
            <header>
              by <a className="reddit-prototype-live-comment-author">{'/u/' + this.props.author}</a>
              &nbsp;
              from discussion in 
              <a className="reddit-prototype-live-comment-subreddit"
                 href={this.props.discussionLink}>{'/r/' + this.props.subreddit}</a>
              &nbsp;|&nbsp;
              <span className="reddit-prototype-live-comment-score">{this.props.score + ' points'}</span>
            </header>
            <div className="md-container"
                 dangerouslySetInnerHTML={{ __html: context.unsafe(this.props.body_html) }} />
          </div>
        </li>;
      }
    });

    $(function() {
      var $discussionLinks = $('#discussions > div > p > a');

      if (!$discussionLinks.length) { return; }

      var topDiscussionLink = $discussionLinks[0];

      var path = context.parseURL(topDiscussionLink.href).pathname + '.json?sort=new';

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
}();
