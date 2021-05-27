const path = require('path');

module.exports = {
  entry: './src/tslogclass.ts',
  mode: 'production',
  output: {
    libraryTarget: 'umd',
    library: 'ts-log-class',
    path: path.join(__dirname, '.webpack'),
    filename: 'index.js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /\.test\.ts(x)?/,
        include: /src/,
        use: [
          { loader: 'ts-loader'}
        ]
      },
    ],
  },
};
