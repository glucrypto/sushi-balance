const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');
module.exports = {
	entry: './src/index.js',
	output: {
		filename: './main.js',
		path: path.resolve(__dirname,'dist'),
		publicPath:"/"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			filename: "./index.html"
		}),
		new MiniCssExtractPlugin({
			filename: "./src/style.css",
			chunckFilename: "style.css"
		}),
		new Dotenv()
	],
	module: {
		rules: [ 
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: "babel-loader"
			}
		},
		{
			test: /\.css$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader']
		}
		],

	},
	node: {
		fs:'empty'
	}
};