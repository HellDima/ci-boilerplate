const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require("path");

module.exports = {
    entry: {
        app: './src/app.js',
        test: './test/add-class.test.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
		publicPath: "/dist",
        filename: "[name].bundle.js"
    },
    module: {
		preLoaders: [
			{
				test: /\.js?$/,
				loader: 'eslint',
				exclude: [/test/, /node_modules/]
			}
		],
		loaders: [
			{
				test: /\.js?$/,
				loader: 'babel',
				exclude: [],
				query: {
					presets: ['streamrail']
				}
			}
		]
	},
    plugins: [
        new webpack.optimize.DedupePlugin(),
		new LiveReloadPlugin({ port: 35740 })
    ],
    devtool: 'source-map',
	devServer: {
		port: 8899
	}
}