module.exports = function (grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var projectConfig = {<% if (node) { %>
        backend: 'backend',<% } %>
        frontend: 'frontend',
        dist: 'dist',<% if (mocha || karma) { %>
        tests: 'test',<% } %>
        port: 8000
    };

    grunt.initConfig({
        project: projectConfig,
        watch: {<% if (bootstrap) { %>
            less: {
                files: ['<%%= project.frontend %>/**/*.less'],
                tasks: ['less:server'],
                options: {
                    atBegin: true
                }
            },<% } %>
            frontend: {
                files: [
                    '{.tmp,<%%= project.frontend %>}/**/*.{html,css,js}'
                ],
                options: {
                    livereload: process.env.LRPORT || true,
                }
            },<% if (node) { %>
            backend: {
                files: ['<%%= project.backend %>/**/*.js'],
                tasks: ['express:backend'],
                options: {
                    nospawn: true
                }
            },<% } %>
        },
        env: {
            server: {
                PORT: projectConfig.port,
                NODE_ENV: 'development'
            },
            dist: {
                NODE_ENV: 'production'
            },
            test: {
                NODE_ENV: 'test',
                PORT: 3001
            }
        },
        preprocess: {
            dist: {
                src: '<%%= project.frontend %>/index.html',
                dest: '<%%= project.dist %>/index.html'
            }
        },
        express: {
            backend: {
                options: {
                    port: projectConfig.port,
                    script: '<%%= project.backend %>'
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['<%%= project.dist %>']
                }]
            },
            heroku: {
                // Remove files which should not be included in heroku dist
                // e.g. whole project.frontend folder is unnecessary because
                // files have been copied/minifed/etc into project.dist
                // Dangerous? Yes, don't run this on working copy... Luckily everything is on git
                files: [{
                    dot: true,
                    src: ['<%%= project.frontend %>'],
                }]
            },
            server: '<%%= project.tmp %>'
        },
        less: {
            options: {
                paths: [
                    '<%%= project.frontend %>/styles',
                    '<%%= project.frontend %>/components'
                ]
            },
            server: {
                files: {
                    '.tmp/styles/main.css': '<%%= project.frontend %>/styles/main.less'
                }
            },
            dist: {
                files: {
                    '<%%= project.dist %>/styles/main.css': '<%%= project.frontend %>/styles/main.less'
                }
            }
        },
        useminPrepare: {
            html: '<%%= project.dist %>/index.html',
            options: {
                root: '<%%= project.frontend %>',
                dest: '<%%= project.dist %>',
            }
        },
        uglify: {
            options: {
                report: 'min'
            }
        },
        cssmin: {
            options: {
                report: 'min'
            },
            dist: {
                src: ['<%%= project.dist %>/styles/main.css'],
                dest: '<%%= project.dist %>/styles/main.css'
            }
        },
        usemin: {
            html: ['<%%= project.dist %>/**/*.html'],
            css: ['<%%= project.dist %>/styles/**/*.css'],
            options: {
                dirs: ['<%%= project.dist %>']
                // Custom js flow: ['concat', 'ngmin', 'uglify'], but how to implement custon ngmin flow?
            }
        },
        htmlmin: {
            dist: {
                options: {
                },
                files: [{
                    expand: true,
                    cwd: '<%%= project.frontend %>',
                    src: [
                        '*.html',
                        '!index.html', // Preprocess handles index.html
                        'views/**/*.html'
                    ],
                    dest: '<%%= project.dist %>'
                }, {
                    // Htmlmin preprocessed index.html in-place
                    expand: true,
                    cwd: '<%%= project.dist %>',
                    src: ['index.html'],
                    dest: '<%%= project.dist %>'
                }]
            }
        },
        ngmin: {
            // Would be nice if usemin would generate this
            dist: {
                // After concat, before uglify
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= project.dist %>/scripts/**/*.js',
                        '<%%= project.dist %>/styles/**/*.css',
                        '<%%= project.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%%= project.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        copy: {
            server: {
                files:[{
                    expand: true,
                    flatten: true,
                    src: ['<%%= project.frontend %>/components/bootstrap/fonts/*'],
                    dest: '.tmp/fonts/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%%= project.frontend %>',
                    dest: '<%%= project.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/**/*.{gif,webp,jpg,jpeg,png}',
                    ]
                }, {
                    expand: true,
                    flatten: true,
                    dest: '<%%= project.dist %>/fonts',
                    src: ['<%%= project.frontend %>/components/bootstrap/fonts/*'],
                }]
            },
        },
        // Frontend tests (PhantomJS)
        mocha: {
            options: {
                mocha: {
                    reporter: 'spec',
                },
            },
        },
        // Backend tests
        mochaTest: {
            options: {
                reporter: 'spec',
            },
            unit: {
                src: ['test/unit/**/*.js'],
            },
        },
    });

    grunt.registerTask('dist', [
        'env:dist',
        'clean:dist',
        'less:dist',
        'preprocess',
        'useminPrepare',
        'cssmin',
        'htmlmin',
        'concat',
        'copy:dist',
        'ngmin',
        'uglify',
        'rev',
        'usemin',
    ]);

    grunt.registerTask('server', [
        'env:server',
        'copy:server',
        'express',
        'watch'
    ]);

    grunt.registerTask('test', function() {
        grunt.config('watch', {
            test: {
                files: [
                    '<%%= project.backend %>/**/*.js',
                    'test/**/*.js'
                ],
                tasks: ['mochaTest:unit'],
                options: {
                    atBegin: true,
                },
            },
        });

        grunt.task.run('env:test');
        grunt.task.run('watch');
    });

    grunt.registerTask('default', ['server']);
    grunt.registerTask('heroku', ['dist', 'clean:heroku']);
};
