var PACKAGE = require('./package.json');
const path = require('path');

module.exports = {
    entry: {
      [PACKAGE.version]: './dist/index.js',
      'latest': './dist/index.js'
    },
    output: {
        filename: 'rentdynamics.[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'RentDynamics'
    }
};
