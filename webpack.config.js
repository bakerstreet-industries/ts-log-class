const path = require('path');

module.exports = {
  entry: './src/main.ts',
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.ts',
      '.tsx'
    ]
  },
  output: {
    libraryTarget: 'umd',
    library: 'ts-log-class',
    path: path.join(__dirname, '.webpack'),
    filename: 'tslogclass.js',
  },
  target: 'node',
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
    ],
  },
};
