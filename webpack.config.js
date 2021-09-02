const path = require('path');

module.exports = {
    mode: 'production',
    entry: './lib/index.js' /*{
        main: './src/index.ts',
        creation: './src/creation/index.ts',
        interfaces: './src/interfaces/index.ts',
        library: './src/library/index.ts',
        transformer: './src/transformer/index.ts'
    }*/,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'esm5'
        // library: 'DataGenerators'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader'
                },
                exclude: /node_modules/
            }
        ]
    },
    target: 'node'
};
