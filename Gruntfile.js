module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            prime_js: {
                src: ['source/js/config.js', 'source/js/prime.js'],
                dest: 'prime.js'
            }
        },
        uglify: {
            prime_min_js: {
                src: ['prime.js'],
                dest: 'prime.min.js'
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
            prime_css: {
                src: ['stylesheets/*.less'],
                dest: 'prime.css'
            }
        },
        clean: [
                './*',
                '!./Gruntfile.js',
                '!./source',
                '!./node_modules',
                '!./package.json'
        ]
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less', 'copy']);
};
