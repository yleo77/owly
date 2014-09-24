
module.exports = function(grunt) {

  var old_browser = grunt.file.readJSON('config.json').old_browser;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [
        './src/owly.js'
      ],
      options: {
        jshintrc: './.jshintrc'
      }
    },

    uglify: {
      options: {},
      dist: {
        files: {
          'dist/owly.js': old_browser ?
            ['src/patch.js', 'src/owly.js'] :
            ['src/owly.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'uglify']);
}
