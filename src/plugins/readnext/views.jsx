'use strict';

const regexThumbnail = /^http/;


export class Post extends React.Component {
  static get defaultProps() {
    return {
      visible: false,
    };
  }

  render() {
    var classSet = React.addons.classSet({
      'reddit-read-next-post': true,
      'hidden': !this.props.visible,
    });
    var thumb = null;
    var { title, score, num_comments: count, permalink, thumbnail } = this.props;

    if (regexThumbnail.test(thumbnail)) {
      thumb = <div className="thumbnail">
        <img src={thumbnail} />
      </div>;
    }

    return <a href={permalink} className={classSet}>
      <div className="reddit-read-next-meta">
        <span>{score} points</span>
        &nbsp;&middot;&nbsp;
        <span>{count} comments</span>
      </div>
      {thumb}
      <div className="reddit-read-next-title">{title}</div>
    </a>;
  }
}


export default class ReadNext extends React.Component {
  static get defaultProps() {
    return {
      posts: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      fixed: false,
    };

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
  }

  componentDidMount() {
    var { shouldComponentLock } = this.props;
    var node = React.findDOMNode(this);

    window.addEventListener('scroll', () => {
      this.setState({
        fixed: shouldComponentLock(node),
      });
    });
  }

  next() {
    var l = this.props.posts.length;
    var i = this.state.index;

    this.setState({
      index: (i + 1) % l,
    });
  }

  prev() {
    var l = this.props.posts.length;
    var i = this.state.index;

    this.setState({
      index: (i + l - 1) % l,
    });
  }

  render() {
    if (!this.props.posts || !this.props.posts.length) {
      return null;
    }

    var index = this.state.index;
    var { subreddit, posts } = this.props;
    var fullSubreddit = `/r/${subreddit}`;
    posts = posts.map((post, i) =>
      <Post {...post} visible={index === i} key={i} />);
    var classSet = React.addons.classSet({
      'reddit-read-next': true,
      'fixed': this.state.fixed,
      'fixed-to-bottom': this.props.lockedToBottom,
    });

    return <div className={classSet}>
      <header>
        also in <a href={fullSubreddit}>{fullSubreddit}</a>
        <div className="reddit-read-next-nav">
          <span className="reddit-read-next-button" onClick={this.prev}>{'<'}</span>
          <span className="reddit-read-next-button" onClick={this.next}>{'>'}</span>
        </div>
      </header>
      <div className="reddit-read-next-post-list">
        {posts}
      </div>
    </div>;
  }
}
