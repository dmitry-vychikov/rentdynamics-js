const path = require('path');

module.exports = {
    entry: './dist/main.js',
    output: {
        filename: 'rentdynamics.js',
        path: path.resolve(__dirname, 'dist')
    }
};