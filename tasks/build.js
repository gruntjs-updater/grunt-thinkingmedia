var path = require('path');
var _ = require('lodash');

/**
 * @param {IGrunt} grunt
 */
module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    /**
     * @type {ThinkingMedia.Common}
     */
    var c = require('./lib/common').init(grunt);

    grunt.task.registerTask('build', 'Performs all tasks to compile the target environment.', function (type) {
        type = type || 'prod';

        switch (type) {
            case 'dev':
                grunt.task.run(['sass:dev']);
                if (grunt.config('index.dev')) {
                    grunt.task.run(['index:dev']);
                }
                break;
            case 'prod':

                // map source HTML to temp HTML paths.
                var sources = c.toHTML(c.config().files);
                var dests = _.map(sources, function (file) {
                    return c.config().temp + file.substr(c.config().webroot.length);
                });

                grunt.config('htmlmin', {
                    build: {
                        options: {
                            collapseWhitespace: true,
                            removeComments: true
                        },
                        files: _.object(dests, sources)
                    }
                });

                var templatesFile = c.config().temp + path.sep + c.config().templates + '.js';
                grunt.config('html2js', {
                    options: {
                        base: c.config().temp,
                        module: c.config().templates,
                        quoteChar: '\'',
                        indentString: ''
                    },
                    prod: {
                        src: c.config().temp + '/**/*.html',
                        dest: templatesFile
                    }
                });

                var jsTarget = c.config().build + path.sep + 'js' + path.sep + c.config().name + '.min.js';
                var files = {};
                files[jsTarget] = c.toJS(c.config().files);
                files[jsTarget].push(templatesFile);

                grunt.config('uglify.build', {
                    screwIE8: true,
                    files: files
                });

                var tasks = [
                    'build:dev',
                    'sass:build',
                    'htmlmin',
                    'html2js',
                    'uglify:build'
                ];
                if (grunt.config('package')) {
                    tasks.push('package');
                }
                grunt.task.run(tasks);
                break;
        }
    });

    grunt.task.registerTask('dev', 'Compiles SASS and updates the index.html', ['build:dev']);
    grunt.task.registerTask('default', ['build:prod']);
};