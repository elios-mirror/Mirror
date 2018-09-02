const path = require('path');
const VueLoader = require('vue-loader');

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
                test: /\.vue$/,
                use: {
                    loader: "vue-loader",
                    options: {
                        extractCSS: true,
                        loaders: {
                            sass: "vue-style-loader!css-loader!sass-loader?indentedSyntax=1",
                            scss: "vue-style-loader!css-loader!sass-loader"
                        }
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
        ]
    },
    plugins: [
        new VueLoader.VueLoaderPlugin()
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.vue']
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'dist')
    }
};