# reddit gnomes

a chrome extension for loading UI experiments on reddit.com

view the individual plugins for more info

## installation

```
git clone https://github.com/madbook/reddit-prototype-readnext.git
```

**for development** you'll also need to:

```
cd reddit-read-next
npm install
grunt
```

1. go to `chrome://extensions` in chrome.
2. make sure the `Developer mode` option is checked.
3. click `Load unpacked extension...`.
4. browse to the `dist/` folder in this repo's folder.
  * **for development** load the `build/` folder instead!
5. visit any comments page on reddit

## updating

To pull down the latest, run `git pull` in the root folder.  If you
are running the 

```
git pull
```

**for development** you'll need to rebuild as well.

Then reload the extension:

1. go to `chrome://extensions` in chrome.
2. click the `Reload` link under this extension


## development

```
npm start
```

`npm start` runs the default grunt task once, then watches the `.jsx` and 
`.less` files used and re-builds.  nothing fancy.

I've added a grunt task to automate reloading the plugin.  It depends on
[chrome-cli](https://github.com/prasmussen/chrome-cli).  If you have `homebrew`,
installing it is easy:

```
brew install chrome-cli --build-from-source
```

If you don't want to install `chrome-cli`, you'll have to reload the plugin
manually using steps above.  You'll probably also get some errors when using
`grunt watch`.  If they are annoying or causing problems, you can just comment
out the `chrome_extension_reload` task in the watch config section of `Gruntfile.js`.

### adding plugins

each plugin is a folder in the `plugins/` directory.  the plugin loader will
attempt to load two files:

1. plugin.jsx (or plugin.js)
2. plugin.less (or plugin.css)

see the `test/` and `prefs/` plugins for reference until I write a more thorough
description of how plugins should be authored.
