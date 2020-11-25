const path = require('path')

module.exports = {
  entry: {
    app: './assets/js/app.js',
    admin: './assets/js/admin.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
}
