const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
  filename: 'main.js',
  },

  target: 'node',
  resolve: { modules: ['node_modules'] },
  externals: [nodeExternals()],
  
};