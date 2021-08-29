// Karma configuration
// Generated on Fri Aug 06 2021 16:42:21 GMT-0400 (Eastern Daylight Time)

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        client: {
            clearContext: false // will show the results in browser once all the testcases are loaded
        },

        // frameworks to use
        // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
        frameworks: ['jasmine', 'karma-typescript'],

        // list of files / patterns to load in the browser
        // files: ['src/**/*.ts'],
        files: [
            'src/creation/data-generator.ts',
            'src/creation/data-generator-experimental.spec.ts',
            'src/creation/data-generator.spec.ts',
            'src/interfaces/data-generator.interface.ts',
            'src/library/primitives.ts',
            'src/library/enum.ts',
            'src/transformer/many.ts',
            'src/transformer/with.ts',
            'src/creation/struct.ts',
            'src/creation/constant.ts',
            'src/creation/constant.spec.ts',
            'src/creation/either.ts',
            'src/creation/either.spec.ts',
            'src/creation/any-of.ts',
            'src/creation/any-of.spec.ts',
            'src/creation/sequence.ts',
            'src/creation/sequence.spec.ts',
            'src/creation/tuple.ts',
            'src/creation/tuple.spec.ts',
            'src/transformer/apply.ts',
            'src/transformer/apply.spec.ts',
            'src/transformer/bind.ts',
            'src/transformer/bind.spec.ts',
            'src/library/increment.ts',
            'src/library/increment.spec.ts'
            // 'src/creation/experimental.spec.ts'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
            'src/**/*.ts': 'karma-typescript'
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                downlevelIteration: true
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
        reporters: ['progress', 'kjhtml', 'karma-typescript'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser instances should be started simultaneously
        concurrency: Infinity
    });
};
