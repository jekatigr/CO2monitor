'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const BabiliPlugin = require("babili-webpack-plugin");


const NODE_ENV = (""+process.env.NODE_ENV).trim() || 'development';
const webpack = require('webpack');
const path = require('path');

var plugins = [
		new webpack.NoEmitOnErrorsPlugin(),
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
        new BabiliPlugin(
            {},
            {
                comments:false
            }
        ),
		new webpack.optimize.AggressiveMergingPlugin()
    );
} 

module.exports = {
	entry: {
		index:  "./src/monitor"
	},

	output: {
		path: __dirname + '/public/js',
		filename: "bundle.js"
	},

	watch: NODE_ENV === 'development',
	devtool: NODE_ENV === 'development' ? "cheap-inline-module-source-map" : false,

	plugins: plugins,

    module: {
        rules: [
            { test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ['env']
                }
            }
        ]
    },

    resolve: {
		modules: [
		    'node_modules'
        ],
		extensions: ['.js']
	}
};
