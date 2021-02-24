const path = require('path')
module.exports = {
  publicPath: '',
  outputDir: path.resolve(__dirname, 'server', 'public'),
  pluginOptions: {
    cordovaPath: 'src-cordova'
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/theme/_mixin.scss";
        `
      }
    }
  },
  productionSourceMap: false
}
