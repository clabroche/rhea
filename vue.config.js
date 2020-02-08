const path = require('path')
module.exports = {
  publicPath: '',
  outputDir: path.resolve(__dirname, 'server', 'public'),
  pluginOptions: {
    cordovaPath: 'src-cordova'
  }
}
