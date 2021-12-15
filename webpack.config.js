const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
  filename: 'main.js',
  path: path.resolve(__dirname, '/public'),
  },

  target: 'node',
  resolve: { modules: ['node_modules'] },
  externals: [nodeExternals()],
  
};