const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
  filename: 'main.js',
  path: path.resolve(__dirname, '/public'),
  },

  target: 'node',
  resolve: { modules: ['node_modules'] },
};