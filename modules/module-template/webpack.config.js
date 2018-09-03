const path = require('path');

module.exports = {
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
                loader: 'vue-html-loader'
            }
        ]
    },
    plugins: [
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'dist')
    }
};