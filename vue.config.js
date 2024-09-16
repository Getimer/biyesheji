const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({

  // assetsDir: 'src/assets',
  // parallel: false,
  publicPath: './dist/',


  transpileDependencies: true,
  lintOnSave: false
})
