const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({

  assetsDir: 'src/assets',
  // parallel: false,
  publicPath: './',


  transpileDependencies: true,
  lintOnSave: false
})
