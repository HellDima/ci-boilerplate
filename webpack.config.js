const webpack = require('webpack');
const path = require("path");

module.exports = {
    entry: {
        app: './src/app.js',
        test: './test/add-class.test.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    module: {
		noParse: [
			/node_modules\/sinon/
		],
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
        new webpack.optimize.DedupePlugin()
    ],
    devtool: 'source-map'
}