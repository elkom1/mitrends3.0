const webpack = require('webpack');
const path = require('path');
const PROD = JSON.parse(process.env.PROD || '0');


module.exports = {
    entry: __dirname + '/src/index.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'mitrends.js',
        library: 'mitrends',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    devtool: 'source-map', // for debugging purposes
    resolve: {
        extensions: [ '.ts', '.js' ],
        alias: {
            '@mitrends': path.resolve('./src')
            }
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader?logLevel=warn' }
        ]
    },
    plugins: PROD ? [
            new webpack.optimize.UglifyJsPlugin({
                minimize: true,
                sourceMap: true,
                output: {
                    comments: false
                },
                compress: { warnings: false }
            })
        ] : []
};
