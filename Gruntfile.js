module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          'build/css/styles.css': 'src/scss/styles.scss'
        }
      },
      prod: {
        options: {
          style: 'compressed'
        },
        files: {
          'build/css/styles.css': 'src/scss/styles.scss'
        }
      },
      mobiledev: {
        options: {
          style: 'expanded'
        },
        files: {
          'build/mobile/css/styles.css': 'src/mobile/scss/styles.scss'
        }
      },
      mobileprod: {
        options: {
          style: 'compressed'
        },
        files: {
          'build/mobile/css/styles.css': 'src/mobile/scss/styles.scss'
        }
      }
    },

    // JSHINT
    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['src/js/**/*.js']
      }
    },

    /// Concat JS and CSS files
    concat: {
      common: {
        src: [
          // 'build/js/plugins.js',
          // 'build/inissia/js/templates.js',
          'src/js/app/**/*.js'
        ],
        dest: 'build/js/P.js'
      },
      mobilecommon: {
        src: [
          'src/mobile/js/app/**/*.js'
        ],
        dest: 'build/mobile/js/P.js'
      },
      plugins: {
        src: [
          'src/js/vendor/jquery-2.1.0.js',
          'src/js/vendor/console.js',
          'src/js/vendor/jquery.mCustomScrollbar.concat.min.js',
          'src/js/vendor/snap.svg-min.js',
          'src/js/vendor/underscore.js',
          'src/js/vendor/backbone.js',
          'src/js/vendor/mousewheel.js'
        ],
        dest: 'build/js/plugins.js'
      }
    },

    uglify: {
        plugins : {
            files: {
              'build/js/plugins.js': ['build/js/plugins.js']
            }
        },
        prod: {
            files: {
              'build/js/N.js': ['build/js/N.js']
            }
        },
        templates:{
            'build/js/templates.js' : ['build/js/templates.js']
        }
    },

    notify: {
        watch: {
          options: {
            title: 'Arte',
            message:'GG'
          }
        }
    },

    //WATCH
    watch: {
      files : [
          'src/scss/**/*.scss',
          'src/js/**/*.js',
          'src/mobile/scss/**/*.scss',
          'src/mobile/js/**/*.js',
          'build/templates/**/*.html',
          'build/templates/**/*.svg'
      ],
      tasks : ['dev'],
      options: {
        livereload: true
      }
    }

  });

  // Load the plugin that provides tasks.
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  // Default task(s).
  grunt.registerTask('dev',
    [
        'sass:dev',
        'sass:mobiledev',
        // 'jshint',
        'concat:plugins',
        'concat:common',
        'concat:mobilecommon',
        'notify'
    ]
  );
  grunt.registerTask('prod' ,
    [
        'sass:prod',
        'sass:mobileprod',
        'jshint',
        'concat:plugins',
        'concat:common',
        'concat:mobilecommon',
        // 'uglify:plugins',
        'uglify:prod',
        // 'uglify:templates',
        'notify'
    ]
  );

  grunt.registerTask('jsplugins',
    ['concat:plugins']
  );

};