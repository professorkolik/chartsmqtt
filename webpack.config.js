const webpack = require('webpack');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV.trim();
const isDevelopment = NODE_ENV === 'development';

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  watch: isDevelopment,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  devtool: 'source-map',
  performance : {
    hints : false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    })
  ],
  node: {
    net: 'empty',
    tls: 'empty'
  }
};