!function() {
  'use strict';

  /**
   * a little localstorage wrapper that we'll use to store plugin state.  saves
   * a plain javascript object to localStorage under the given key (reddit-gnomes)
   * as a JSON string.  As long as the setState and set methods are used, you
   * don't have to worry about manually committing the changes.  Maybe not the
   * most efficient, but hey, it doesn't have to be :)
   */
  
    function Store(key) {
      this.key = key;

      if (localStorage[key]) {
        this.state = JSON.parse(localStorage[key]);
      } else {
        this.state = {};
      }
    }

    Store.prototype.setState=function(newState) {
      var willChange = false;
      
      for (var key in newState) {
        if (typeof newState.key === 'object' || this.state[key] !== newState[key] &&
            !willChange) {
          willChange = true;
        }

        this.state[key] = newState[key];
      }

      if (willChange) {
        this.$Store_commit();
      }
    };

    Store.prototype.set=function(key, val) {
      var parts = key.split('/');
      var target = this.state;
      var l = parts.length - 1;
      for (var i = 0; i < l; i++) {
        if (target && target instanceof Object) {
          target = target[parts[i]];
        } else {
          throw ("invalid path, " + parts[i] + " is not an object!");
        }
      }

      key = parts[l];

      if (target[key] !== val) {
        target[key] = val;
        this.$Store_commit();
      }
    };

    Store.prototype.$Store_commit=function() {
      localStorage[this.key] = JSON.stringify(this.state);
    };

    Store.prototype.keys=function() {
      return Object.keys(this.state);
    };
  

  /**
   * we'll derive some info from the current path and put it in an object to
   * pass around to the plugins; this is the kind of stuff that a lot of plugins
   * are probably going to need to know about, there's no sense in making them
   * all do the work independently
   */
  
  var protocolPattern = /^(https?:)/;
  var hostPattern = /([a-zA-Z0-9_\-\.]{3,}\.[a-zA-Z]{2,3})/;
  var unsafeDiv = document.createElement('div');

  
    function Context(pathname) {
      this.location = this.parseURL(pathname);
    }

    Context.prototype.parseURL=function(url) {
      var protocolMatch = url.match(protocolPattern);
      var protocol;

      if (protocolMatch) {
        protocol = protocolMatch[0];
        url = url.replace(protocol, '');
      } else {
        protocol = location.protocol;
      }

      var hostMatch = url.match(hostPattern);
      var host;

      if (hostMatch) {
        host = hostMatch[0];
        url = url.replace(host, '');
      } else {
        host = location.host;
      }

      var parts = url.replace(/\//g, ' ').trim().split(' ');
      var subreddit = parts[0] === 'r' ? parts[1] : null;
      var pageID = subreddit ? 2 : 0;
      var page = parts[pageID] || null;
      var thing = page ? parts[pageID + 1] : null;
      var pathname = '/' + parts.join('/');

      return {parts:parts, pathname:pathname, subreddit:subreddit, page:page, thing:thing, protocol:protocol, host:host};
    };

    Context.prototype.unsafe=function(text) {
      unsafeDiv.innerHTML = text;
      return unsafeDiv.innerText;
    };
  

  var store = new Store('reddit-gnomes');
  var context = new Context(location.pathname);
  var initQueue = [];

  /**
   * this function should be used to initialize every plugin.  each plugin
   * should pass in a unique name and a function to initialize the plugin.
   * the unique name will be stored in localStorage with a boolean value to
   * determine if that plugin should be initialized.  If it is true (default), 
   * a css class will be added to the html element of the page (gnome-<name>) 
   * and the initialization function will be called with the context and store
   * objects defined above.
   */
  window.initPlugin = function initPlugin(name, description, init) {
    if (!init && typeof description === 'function') {
      init = description;
      description = '';
    }

    if (typeof store.state[name] === 'undefined') {
      store.set(name, {
        enabled: true,
        description:description,
      });
    }
    
    if (store.state[name].enabled) {
      initQueue.push(init);
    }
  };

  var gnomeClasses = [];

  /*
    hack to experiment with writing plugins as es6 classes.
    have to queue these up to make sure that the class is fully defined prior
    to initializing.  if the call to registerPlugin happens _above_ the function
    definition, the function will exist but the methods will not have been
    defined on the prototype yet.  Thanks javascript.
   */
  window.registerPlugin = function registerPlugin(GnomePlugin) {
    gnomeClasses.push(GnomePlugin);
  }

  function registerPluginClass(GnomePlugin) {
    if (GnomePlugin instanceof Function) {
      var plugin = new GnomePlugin;
      var run = plugin.run.bind(plugin);

      if (plugin.getMetadata instanceof Function) {
        var $__0=   plugin.getMetadata(),name=$__0.name,description=$__0.description;
      } 

      name = name || GnomePlugin.name;
      description = description || '';

      window.initPlugin(name, description, run);
    } else {
      throw "plugin must be a function";
    }
  }

  $(function() {
    gnomeClasses.forEach(function(GnomePlugin)  {return registerPluginClass(GnomePlugin);});
    var pluginClassNames = store.keys().map(function(key)  {return 'gnome-' + key;}).join(' ');
    $('html').addClass(pluginClassNames);
    initQueue.forEach(function(init)  {return init(context, store);});
  });
}();

!function() {
  'use strict';

  window.initPlugin(
    'juicy-votes',
    'adds juicy animations to vote arrows.  that\'s right. juicy.',
    plugin);
  
  function plugin(context) {
    $('.arrow').on('click', function() {
      var $this = $(this);

      if ($this.hasClass('upmod') || $this.hasClass('downmod')) {
        $this.addClass('reddit-prototype-juicy-ui-pulse');
      } else if ($this.hasClass('up') || $this.hasClass('down')) {
        $this.removeClass('reddit-prototype-juicy-ui-pulse');
      }
    });
  }
}();

!function() {
  'use strict';

  window.initPlugin(
    'live-comments',
    'pulls comments into reddit live threads from related discussions',
    plugin);

  function plugin(context, store) {
    var Comment = React.createClass({displayName: "Comment",
      render:function() {
        return React.createElement("li", {className: "liveupdate"}, 
          React.createElement("a", {href: "#"}, 
            React.createElement("time", {className: "live-timestamp"}, "some time ago")
          ), 
          React.createElement("div", {className: "body reddit-prototype-live-comment"}, 
            React.createElement("header", null, 
              "by ", React.createElement("a", {className: "reddit-prototype-live-comment-author"}, '/u/' + this.props.author), 
              " " + ' ' +
              "from discussion in",  
              React.createElement("a", {className: "reddit-prototype-live-comment-subreddit", 
                 href: this.props.discussionLink}, '/r/' + this.props.subreddit), 
              " | ", 
              React.createElement("span", {className: "reddit-prototype-live-comment-score"}, this.props.score + ' points')
            ), 
            React.createElement("div", {className: "md-container", 
                 dangerouslySetInnerHTML: { __html: context.unsafe(this.props.body_html)}})
          )
        );
      }
    });

    $(function() {
      var $discussionLinks = $('#discussions > div > p > a');

      if (!$discussionLinks.length) { return; }

      var topDiscussionLink = $discussionLinks[0];

      var path = context.parseURL(topDiscussionLink.href).pathname + '.json?sort=new';

      $.get(path).then(function(res) {
        if (!res || res.length !== 2) { return; } 

        var comments = res[1].data.children.map(function(child)  {return child.data;});
        var $liveUpdates = $('.liveupdate-listing .liveupdate');

        var i = 0;
        var j = 0;

        var getCommentTime = (function(comment)  {return comment.created_utc * 1000;});
        var getLiveUpdateTime = (function(liveUpdate)  {return (new Date($(liveUpdate).find('time')[0].getAttribute('datetime'))).getTime();});

        var commentTime = getCommentTime(comments[i]);
        var liveUpdateTime = getLiveUpdateTime($liveUpdates[j]);

        while (true) {
          if (commentTime >= liveUpdateTime) {
            // if the comment is newer than the liveUpdate
            // insert above and check the next comment
            $liveUpdates.eq(j).before(
              $.parseHTML(React.renderToStaticMarkup(React.createElement(Comment, React.__spread({},  comments[i], {discussionLink: topDiscussionLink.href}))))
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

!function() {
  'use strict';

  window.initPlugin(
    'prefs',
    'creates UI on the user preference page to enable and disable plugins',
    plugin);

  function plugin(context, store) {
    if (context.location.page !== 'prefs') { return; }

    var GnomePrefInput = React.createClass({displayName: "GnomePrefInput",
      getInitialState:function() {
        var val = this.props.val;
        return {val:val};
      },

      render:function() {
        return React.createElement("div", {className: 'gnome-pref-for-' + this.props.name}, 
          React.createElement("input", {ref: "checkbox", type: "checkbox", name: this.props.name, checked: this.state.val, onClick: this.handleClick}), 
          React.createElement("label", {for: this.props.name}, this.props.name), 
          " ", 
          React.createElement("span", {className: "little gray"}, "(", this.props.description || '', ")")
        );
      },

      handleClick:function() {
        var key = this.props.name;
        var val = !this.state.val;
        store.set((key + "/enabled"), val);
        this.setState({val:val});
      },
    });

    var GnomePrefs = React.createClass({displayName: "GnomePrefs",
      render:function() {
        var prefs = store.keys().map(function(key) {
          var $__0=   store.state[key],enabled=$__0.enabled,description=$__0.description;

          return React.createElement(GnomePrefInput, {key: key, 
                                 name: key, 
                                 description: description, 
                                 val: enabled})
        });

        return React.createElement("div", {className: "gnome-prefs-panel"}, prefs);
      }
    });

    var prefTable = $.parseHTML(("\n      <table class=\"preftable pretty-form gnome-prefs-table\">\n        <tr>\n          <th>gnome options</th>\n          <td class=\"prefright\">\n          </td>\n        </tr>\n      </table>\n    "







));
    var mountNode = document.createElement('div');

    $(prefTable).find('.prefright').append(mountNode);
    $('.content form').eq(0).after(prefTable);
    React.render(React.createElement(GnomePrefs, null), mountNode);
  }
}();

!function($) {
  'use strict';

  window.initPlugin(
    'readnext',
    'adds a widget to the sidebar on comments page that suggests next posts',
    plugin);
  
  function plugin(context, store) {
    if (!context.location.page === 'comments') { return; }

    var $__0=   context.location,subreddit=$__0.subreddit,thing=$__0.thing;
    var fullname = 't3_' + thing;
    var params = $.param({
      count: '10',
      after: fullname,
    });
    var requestPath = '/r/' + subreddit + '.json?' + params;
    var regexThumbnail = /^http/;
    var mountNode = document.createElement('div');
    var $mountNode = $(mountNode);
    
    var Post = React.createClass({displayName: "Post",
      getDefaultProps:function() {
        return {
          visible: false,
        };
      },

      render:function() {
        var classSet = React.addons.classSet({
          'reddit-read-next-post': true,
          'hidden': !this.props.visible,
        });
        var thumb = null;

        if (regexThumbnail.test(this.props.thumbnail)) {
          thumb = React.createElement("div", {className: "thumbnail"}, 
            React.createElement("img", {src: this.props.thumbnail})
          );
        }

        return React.createElement("a", {href: this.props.permalink, className: classSet}, 
          thumb, 
          React.createElement("div", {className: "reddit-read-next-title"}, this.props.title), 
          React.createElement("div", {className: "reddit-read-next-meta"}, 
            React.createElement("span", null, this.props.score, " points"), 
            " · ", 
            React.createElement("span", null, this.props.num_comments, " comments")
          )
        );
      },
    });

    var ReadNext = React.createClass({displayName: "ReadNext",
      getDefaultProps:function() {
        return {
          posts: [],
        };
      },

      getInitialState:function() {
        return {
          index: 0,
          fixed: false,
        };
      },

      componentWillMount:function() {
        window.addEventListener('scroll', function() {
          var scroll = window.scrollY;
          var nodePosition = $mountNode.position().top;

          this.setState({
            fixed: scroll >= nodePosition,
          });
        }.bind(this));
      },

      next:function() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + 1) % l,
        });
      },

      prev:function() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + l - 1) % l,
        });
      },

      render:function() {
        if (!this.props.posts || !this.props.posts.length) {
          return null;
        }

        var index = this.state.index;
        var fullSubreddit = '/r/' + this.props.subreddit;
        var posts = this.props.posts.map(function(post, i) {
          return React.createElement(Post, React.__spread({},  post, {visible: index === i, key: i}));
        });
        var classSet = React.addons.classSet({
          'reddit-read-next': true,
          'fixed': this.state.fixed,
        });

        return React.createElement("div", {className: classSet}, 
          React.createElement("header", null, 
            "also in ", React.createElement("a", {href: fullSubreddit}, fullSubreddit), 
            React.createElement("div", {className: "reddit-read-next-nav"}, 
              React.createElement("span", {className: "reddit-read-next-button", onClick: this.prev}, '<'), 
              React.createElement("span", {className: "reddit-read-next-button", onClick: this.next}, '>')
            )
          ), 
          React.createElement("div", {className: "reddit-read-next-post-list"}, 
            posts
          )
        );
      },
    });

    $.get(requestPath).then(function(res) {
      var postListData = res.data.children.map(function(child) {
        return child.data;
      });

      $('body > .side').append(mountNode);

      React.render(
        React.createElement(ReadNext, {posts: postListData, 
                  subreddit: subreddit}),
        mountNode
      );
    });
  }
}(jQuery);

!function() {
  'use strict';

  window.registerPlugin(TestPlugin);

  function TestPlugin(){}
    TestPlugin.prototype.getMetadata=function() {
      return {
        name: 'test',
        description: ("performs a console log and checks for the \"gnome-test\"\n                      css class on the html element."
),
      };
    };

    TestPlugin.prototype.run=function(context, store) {
      var gnomeClassFound = $('html').hasClass('gnome-test');
      console.log(
("--------\ntest init function has run!\nthe html element does " + 

(gnomeClassFound ? '' : 'not ') + "have the \n'gnome-test' class.\n--------"

)
      );
    };
  
}();

!function() {
  'use strict';

  window.initPlugin(
    'top-comment',
    'adds a link to posts on listing pages to load the top comment inline',
    plugin);

  function plugin(context, store) {
    if (context.location.page) { return; }

    var $things = $('#siteTable .thing');

    if (!$things.length) { return; }

    var onFrontpage = !context.location.subreddit;
    var buttonTemplate = ("<li>\n      <a class=\"reddit-prototype-top-comment\" href=\"#\">[top comment]</a>\n    </li>"

);

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
      var pathObj = onFrontpage ? context.parseURL($parent.find('a.subreddit').attr('href')) : context.location;
      var params = $.param({
        limit: 1,
        sort: 'top',
      });
      var path = (pathObj.pathname + "/comments/" + id + ".json?" + params);

      $.get(path).then(function(res) {
        var comment = res[1].data.children[0].data;
        $parent.find('.entry').append(
          $.parseHTML(("<div class=\"reddit-prototype-top-comment-text md-container\">\n            " + 
context.unsafe(comment.body_html) + "\n          </div>"
))
        );
        $this.remove();
      });
    });
  }
}();
