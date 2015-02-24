module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');

  var lessFiles = {
    "build/css/gnomes.css": [
      "src/less/main.less",
      "src/plugins/**/*.less",
      "src/plugins/**/*.css",
    ],
  };

  var devLessFiles = {
    "build/css/gnomes.css": lessFiles["build/css/gnomes.css"].concat([
      "src/dev_plugins/**/*.less",
      "src/dev_plugins/**/*.css",
    ]),
  };

  var jsxFiles = [
    'src/jsx/main.jsx',
    'src/plugins/**/plugin.jsx',
    'src/plugins/**/plugin.js',
  ];

  var devJSXFiles = jsxFiles.concat([
    'src/dev_plugins/**/plugin.jsx',
    'src/dev_plugins/**/plugin.js',
  ]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        browserifyOptions: {
          extensions: ['.jsx', '.js', '.es6'],
        },
        transform: ['babelify']
      },
      dist: {
        files: {
          './build/js/gnomes.js': './src/jsx/main.jsx',
        },
      },
    },
    less: {
      development: {
        files: devLessFiles,
      },
      production: {
        files: lessFiles,
        option: {
          cleancss: true,
        },
      },
    },
    watch: {
      main: {
        files: ['src/**/*.jsx', 'src/**/*.less', 'src/**/*.js', 'src/**/*.css'],
        tasks: [
          'default',
        ],
      },
    },
    copy: {
      development: {
        files: [
          {
            expand: true,
            src: [
              'bower_components/**/*',
              'manifest.json',
            ],
            dest: 'build/',
          },
        ],
      },
      production: {
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: [
              '**',
            ],
            dest: 'dist/',
          },
        ],
      },
    },
  });


  // taken from grunt-chrome-extension-reload
  // that grunt plugin doesn't actually work as a plugin in its current state
  // but seems to if you copy in the code into the main gruntfile :/
  grunt.loadNpmTasks('grunt-external-daemon');
  grunt.loadNpmTasks('grunt-exec');

  var chromeExtensionTabId = 0;

  grunt.config.merge({
    exec: {
      reloadChromeTab: {
        cmd: function() {
          return chromeExtensionTabId ? "chrome-cli reload -t " + chromeExtensionTabId : "chrome-cli open chrome://extensions && chrome-cli reload"; 
        }
      }
    },

    external_daemon: {
      getExtensionTabId: {
        options: {
          verbose: true,
          startCheck: function(stdout, stderr) {

            // Find any open tab in Chrome that has the extensions page loaded, grab ID of tab
            var extensionTabMatches = stdout.match(/\[\d{1,5}\] Extensions/);

            if(extensionTabMatches){
              var chromeExtensionTabIdContainer = extensionTabMatches[0].match(/\[\d{1,5}\]/)[0];

              chromeExtensionTabId = chromeExtensionTabIdContainer.substr(1, chromeExtensionTabIdContainer.length - 2);
              console.log("Chrome Extension Tab #: " + chromeExtensionTabId);
            }

            return true;
          }
        },
        cmd: "chrome-cli",
        args: ["list", "tabs"]
      }
    },
  });

  grunt.registerTask('chrome_extension_reload',
    ['external_daemon:getExtensionTabId', 'exec:reloadChromeTab']
  );

  grunt.registerTask('default', ['browserify', 'less:development', 'copy:development', 'chrome_extension_reload']);
  grunt.registerTask('package', ['browserify', 'less:production', 'copy:production']);
};
