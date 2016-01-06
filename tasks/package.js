var _ = require('lodash');

/**
 * @param {IGrunt} grunt
 */
module.exports = function (grunt) {

    /**
     * @type {ThinkingMedia.Common}
     */
    var c = require('./lib/common').init(grunt);

    c.load('grunt-contrib-cssmin');
    c.load('grunt-contrib-uglify');

    grunt.task.registerMultiTask('package', 'Handles the creation of minified JS/CSS files', function () {
        var self = this;
        var options = this.options({
            minify: false,
            clear: []
        });

        if (options.minify === true) {

            var dest = self.data.dest.trim().toLowerCase();
            var minify = _.clone(self.data);
            delete minify.options;

            if (_.endsWith(dest, '.css')) {
                grunt.config('cssmin.package', minify);
                grunt.task.run(['cssmin:package']);
            }

            if (_.endsWith(dest, '.js')) {
                grunt.config('uglify.package', minify);
                grunt.task.run(['uglify:package']);
            }

        } else {
            // concat the files
            var src = _.map(self.filesSrc, function (filepath) {
                if (grunt.file.isDir(filepath)) {
                    return "";
                }
                return grunt.file.read(filepath);
            }).join("\n");

            // save the concat version
            grunt.file.write(self.data.dest, src);
            grunt.log.writeln('File ' + self.data.dest + ' created.');
        }

        // clear unwanted files
        if (_.isArray(options.clear)) {
            _.each(options.clear || [], function (filepath) {
                grunt.file.delete(filepath);
            });
        }
    });

};