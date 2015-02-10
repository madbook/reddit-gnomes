module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  var lessFiles = {
    "build/css/gnomes.css": [
      "src/less/main.less",
      "src/plugins/**/*.less",
      "src/plugins/**/*.css",
    ],
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    react: {
      options: {
        harmony: true,
      },
      combined_file_output: {
        files: {
          'build/js/gnomes.js': [
            'src/jsx/main.jsx',
            'src/plugins/**/plugin.jsx',
            'src/plugins/**/plugin.js',
          ],
        },
      },
    },
    less: {
      development: {
        files: lessFiles,
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
          // if you don't have chrome-cli (and don't want it) but grunt is 
          // throwing errors for you, comment this out!
          'chrome_extension_reload',
        ],
      },
    },
    copy: {
      main: {
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
      package: {
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

  grunt.registerTask('default', ['react', 'less', 'copy']);
  grunt.registerTask('package', ['default', 'copy:package']);
};
