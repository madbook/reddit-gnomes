'use strict';

export default React.createClass({
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