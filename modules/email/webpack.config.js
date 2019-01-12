const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html/,
                loader: 'html-css-obfuscator'
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'dist')
    }
};