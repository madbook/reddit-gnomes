!function($) {
  'use strict';

  window.initPlugin(
    'readnext',
    'adds a widget to the sidebar on comments page that suggests next posts',
    plugin);
  
  function plugin(context, store) {
    if (context.location.page !== 'comments') { return; }

    var {subreddit, thing} = context.location;
    var fullname = 't3_' + thing;
    var params = $.param({
      count: '10',
      after: fullname,
    });
    var requestPath = '/r/' + subreddit + '.json?' + params;
    var regexThumbnail = /^http/;
    var mountNode = document.createElement('div');
    var $mountNode = $(mountNode);
    
    var Post = React.createClass({
      getDefaultProps() {
        return {
          visible: false,
        };
      },

      render() {
        var classSet = React.addons.classSet({
          'reddit-read-next-post': true,
          'hidden': !this.props.visible,
        });
        var thumb = null;

        if (regexThumbnail.test(this.props.thumbnail)) {
          thumb = <div className="thumbnail">
            <img src={this.props.thumbnail} />
          </div>;
        }

        return <a href={this.props.permalink} className={classSet}>
          {thumb}
          <div className="reddit-read-next-title">{this.props.title}</div>
          <div className="reddit-read-next-meta">
            <span>{this.props.score} points</span>
            &nbsp;&middot;&nbsp;
            <span>{this.props.num_comments} comments</span>
          </div>
        </a>;
      },
    });

    var ReadNext = React.createClass({
      getDefaultProps() {
        return {
          posts: [],
        };
      },

      getInitialState() {
        return {
          index: 0,
          fixed: false,
        };
      },

      componentWillMount() {
        window.addEventListener('scroll', function() {
          var scroll = window.scrollY;
          var nodePosition = $mountNode.position().top;

          this.setState({
            fixed: scroll >= nodePosition,
          });
        }.bind(this));
      },

      next() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + 1) % l,
        });
      },

      prev() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + l - 1) % l,
        });
      },

      render() {
        if (!this.props.posts || !this.props.posts.length) {
          return null;
        }

        var index = this.state.index;
        var fullSubreddit = '/r/' + this.props.subreddit;
        var posts = this.props.posts.map(function(post, i) {
          return <Post {...post} visible={index === i} key={i} />;
        });
        var classSet = React.addons.classSet({
          'reddit-read-next': true,
          'fixed': this.state.fixed,
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
      },
    });

    $.get(requestPath).then(function(res) {
      var postListData = res.data.children.map(function(child) {
        return child.data;
      });

      $('body > .side').append(mountNode);

      React.render(
        <ReadNext posts={postListData}
                  subreddit={subreddit} />,
        mountNode
      );
    });
  }
}(jQuery);
