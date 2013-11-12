module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var projectConfig = {<% if (node) { %>
        backend: 'backend',<% } %><% if (bootstrap) { %>
        frontend: 'frontend',
        dist: 'dist',<% } %><% if (mocha || karma) { %>
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
            },<% } %><% if (bootstrap) { %>
            frontend: {
                files: [
                    '{.tmp,<%%= project.frontend %>}/**/*.{html,css,js}'
                ],
                options: {
                    livereload: process.env.LRPORT || true,
                }
            },<% } %><% if (node) { %>
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
            prod: {
                NODE_ENV: 'production'
            },<% if (mocha || karma) { %>
            test: {
                NODE_ENV: 'test',
                PORT: 3001
            }<% } %>
        },<% if (bootstrap) { %>
        preprocess: {
            dist: {
                src: '<%%= project.frontend %>/index.html',
                dest: '<%%= project.dist %>/index.html'
            }
        },<% } %>
        express: {
            backend: {
                options: {
                    port: projectConfig.port,
                    script: '<%%= project.backend %>'
                }
            }
        },
        clean: {
            dist: '<%%= project.dist %>',
            server: '<%%= project.tmp %>',
        },<% if (bootstrap) { %>
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
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= project.dist %>/scripts/**/*.js',
                        '<%%= project.dist %>/styles/**/*.css',
                        '<%%= project.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%%= project.dist %>/components/fonts/*',
                    ]
                }
            }
        },
        copy: {
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
                        'components/bootstrap/fonts/*',
                    ]
                }]
            },
        },<% } %><% if (angular) { %>
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
        },<% } %><% if (mocha) { %>
        mochaTest: {
            options: {
                reporter: 'spec',
            },
            unit: {
                src: ['test/unit/**/*.js'],
            },
        },<% } %><% if (karma) { %>
        karma: {}
        <% } %>
    });

    grunt.registerTask('dist', [
        'env:prod',
        'clean:dist',<% if (bootstrap) { %>
        'less:dist',<% } %>
        'preprocess',<% if (bootstrap) { %>
        'useminPrepare',
        'cssmin',
        'htmlmin',
        'concat',<% } %>
        'copy:dist',<% if (bootstrap) { %>
        'ngmin',
        'uglify',
        'rev',
        'usemin',<% } %>
    ]);

    grunt.registerTask('server', [
        'env:server',
        'copy:server',
        'express',
        'watch'
    ]);

    grunt.registerTask('default', ['server']);
};
