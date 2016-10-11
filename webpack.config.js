'use strict';

var CleanWebpackPlugin = require('clean-webpack-plugin');

const NODE_ENV = (""+process.env.NODE_ENV).trim() || 'development';
const webpack = require('webpack');
const path = require('path');

var plugins = [
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
		  NODE_ENV: JSON.stringify(NODE_ENV)
		}),
		new CleanWebpackPlugin(['public/js'], {
		  root: __dirname,
		  verbose: true, 
		  dry: false
		})
	];

if (NODE_ENV === 'production') {
	console.log('adding production plugins...');
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({ comments: false }),
	  new webpack.optimize.DedupePlugin(),
	  new webpack.optimize.AggressiveMergingPlugin()
  );
} 

module.exports = {

  entry: {
    index:  "./src/monitor"
  },

    resolveLoader: {
        root: path.join(__dirname, 'node_modules')
	},
  
  output: {
    path:     __dirname + '/public/js',
    filename: "bundle.js"
  },

  watch: NODE_ENV == 'development',
  devtool: NODE_ENV == 'development' ? "cheap-inline-module-source-map" : null,

  plugins: plugins, 

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  },

};
