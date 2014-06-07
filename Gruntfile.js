module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            number_theorist_js: {
                src: ['source/js/config.js', 'source/js/main.js'],
                dest: 'number-theorist.js'
            }
        },
        uglify: {
            prime_min_js: {
                src: ['number-theorist.js'],
                dest: 'number-theorist.min.js'
            }
        },
        jshint: {
                files: ['Gruntfile.js', 'source/js/*.js'],
                options: {
                    globals: {
                        jQuery: true,
                        document: true
                    }
                }
        },
        copy: {
            index_html: {
                src: ['source/index.html'],
                dest: 'index.html'
            }
        },
        less: {
            number_theorist_css: {
                src: ['source/stylesheets/*.less'],
                dest: 'number-theorist.css'
            }
        },
        clean: {
            dist: {
                src: [
                    '*',
                    '!Gruntfile.js',
                    '!source',
                    '!node_modules',
                    '!package.json',
                    '!README.md'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less', 'copy']);
};
