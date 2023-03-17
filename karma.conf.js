// Karma configuration
// Generated on Fri Aug 06 2021 16:42:21 GMT-0400 (Eastern Daylight Time)
const configureKarma = require('./dist/cjs/compiler').configureKarma;

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
        files: ['src/**/*.ts'],

        // list of files / patterns to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
            'src/**/*.ts': 'karma-typescript'
        },

        karmaTypescriptConfig: {
            compilerOptions: {
                downlevelIteration: true,
                esModuleInterop: true,
                lib: ["ESNext"]
            },
            bundlerOptions: {
                resolve: {
                    alias: {
                        perf_hooks: './node_modules/@types/node/perf_hooks.d.ts'
                    }
                }
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
        browsers: ['ChromeDebugging'],

        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser instances should be started simultaneously
        concurrency: Infinity
    });
};
