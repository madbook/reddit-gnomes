!function() {
  'use strict';

  /**
   * a little localstorage wrapper that we'll use to store plugin state.  saves
   * a plain javascript object to localStorage under the given key (reddit-gnomes)
   * as a JSON string.  As long as the setState and set methods are used, you
   * don't have to worry about manually committing the changes.  Maybe not the
   * most efficient, but hey, it doesn't have to be :)
   */
  class Store {
    constructor(key) {
      this.key = key;

      if (localStorage[key]) {
        this.state = JSON.parse(localStorage[key]);
      } else {
        this.state = {};
      }
    }

    setState(newState) {
      var willChange = false;
      
      for (var key in newState) {
        if (typeof newState.key === 'object' || this.state[key] !== newState[key] &&
            !willChange) {
          willChange = true;
        }

        this.state[key] = newState[key];
      }

      if (willChange) {
        this._commit();
      }
    }

    set(key, val) {
      var parts = key.split('/');
      var target = this.state;
      var l = parts.length - 1;
      for (var i = 0; i < l; i++) {
        if (target && target instanceof Object) {
          target = target[parts[i]];
        } else {
          throw `invalid path, ${parts[i]} is not an object!`;
        }
      }

      key = parts[l];

      if (target[key] !== val) {
        target[key] = val;
        this._commit();
      }
    }

    _commit() {
      localStorage[this.key] = JSON.stringify(this.state);
    }

    keys() {
      return Object.keys(this.state);
    }
  }


  var protocolPattern = /^(https?:)/;
  var hostPattern = /([a-zA-Z0-9_\-\.]{3,}\.[a-zA-Z]{2,3})/;

  class Location {
    static parseURL(url) {
      return new Location(url);
    }

    constructor(url) {
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

      this.parts = parts;
      this.pathname = pathname;
      this.subreddit = subreddit;
      this.page = page;
      this.thing = thing;
      this.protocol = protocol;
      this.host = host;
    }
  }


  /*
    hooks system lifted from reddit
    see r2/r2/lib/hooks.py
   */

  var _hooks = {};

  class Hook {
    static getHook(name) {
      return _hooks[name] || (_hooks[name] = new Hook())
    }

    static getAllHooks() {
      return _hooks;
    }

    constructor() {
      this._handlers = [];
    }

    registerHandler(handler) {
      this._handlers.push(handler);
    }

    call(...args) {
      return this._handlers.map(handler => handler.apply(null, args));
    }

    callUntilReturn(...args) {
      var res;
      this._handlers.some(function(handler) {
        res = handler.apply(null, args)
        return res !== null && res !== undefined;
      });
      return res;
    }
  }


  class HookRegistrar {
    constructor() {
      this.registered = false;
      this._connections = [];
    }

    on(name, fn) {
      var hook = Hook.getHook(name);
      var handler = (...args) => fn.apply(this, args); 

      if (this.registered) {
        hook.registerHandler(handler);
      } else {
        this._connections.push([hook, handler]);
      }

      return fn;
    }

    registerAll() {
      this._connections.forEach(connection => {
        var [hook, handler] = connection;

        hook.registerHandler(handler);
        this.registered = true;
      });
    }
  }

  // hacky, need to do this better
  window.Hook = Hook;
  window.HookRegistrar = HookRegistrar;

  /**
   * we'll derive some info from the current path and put it in an object to
   * pass around to the plugins; this is the kind of stuff that a lot of plugins
   * are probably going to need to know about, there's no sense in making them
   * all do the work independently
   */

  var unsafeDiv = document.createElement('div');

  class Context {
    constructor(pathname) {
      this.location = this.parseURL(pathname);
    }

    parseURL(url) {
      return Location.parseURL(url);
    }

    unsafe(text) {
      unsafeDiv.innerHTML = text;
      return unsafeDiv.innerText;
    }
  }

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
        description,
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
        var {name, description} = plugin.getMetadata();
      } 

      name = name || GnomePlugin.name;
      description = description || '';

      window.initPlugin(name, description, run);
    } else {
      throw "plugin must be a function";
    }
  }

  $(function() {
    gnomeClasses.forEach(GnomePlugin => registerPluginClass(GnomePlugin));
    var pluginClassNames = store.keys().map(key => 'gnome-' + key).join(' ');
    $('html').addClass(pluginClassNames);
    initQueue.forEach(init => init(context, store));
  });
}();
