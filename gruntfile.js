module.exports = (grunt) => {
    //load plugins
    [
        'grunt-mocha-test',
        'grunt-eslint',
        'grunt-exec'
    ].forEach((task) => {
        grunt.loadNpmTasks(task);
    });

    //configure plugins
    grunt.initConfig({
        mochaTest : {
            all: {
                src : 'qa/tests-*.js', 
                options : {ui : 'tdd', timeout : 100000}
            }
        },

        eslint : {
            app : [
                'meadowlark.js',
                'public/js/**/*.js',
                'lib/**/*.js',
                'handlers/**/*.js',
                'models/**/*.js'
            ],
            qa : [
                'grunt.js', 
                'public/qa/**/*.js',
                'qa/**/*.js'
            ]
        },
        exec : {
            linkchecker : {cmd : 'linkchecker http://localhost:3000'}
        }
    });

    //register tasks
    grunt.registerTask('default', ['mochaTest', 'eslint', 'exec']);
}