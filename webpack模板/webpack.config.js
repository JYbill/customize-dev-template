const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  //入口文件
  entry: './src/main.js',
  //出口文件
  output: {
    //path.resolve是node里面的绝对路径，__dirname是package.json里面自带的的全局变量  'dist'是自定义的文件夹
    //path 这整个代表，导出到当前文件夹下的dist文件夹
    path: path.resolve(__dirname, 'dist'),
    //filename 文件名
    filename: 'bundle.js',
    //将url引用目录前缀加上...
    // publicPath: 'dist/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        //style-loader解析css文件
        //css-loader 导入css文件
        use: ['style-loader', 'css-loader' ]
      },
      {
        test: /\.less$/,
        use: [{
            loader: "style-loader" // creates style nodes from JS strings
        }, {
            loader: "css-loader" // translates CSS into CommonJS
        }, {
            loader: "less-loader" // compiles Less to CSS
        }]
    },
    {
      //jpeg有的图片格式是这个
      test: /\.(png|jpg|gif|jpeg)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            //加载图片时，小于limit时，会将图片编译成base64字符串形式
            //加载图片时，大于limit时，需要使用file-loader模块进行加载
            limit: 3000,
            name: 'img/[name].[hash:8].[ext]'
          }
        }
      ]
    },
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      }
    },
    //配置Vue-loader
    {
      test: /\.vue$/,
      use: {
        loader: 'vue-loader'
      }
    }
    ]
  },
  resolve:{
    //别名vue/dist/vue.esm.js->a
    alias: {
        'Vue$':'vue/dist/vue.esm.js'
    },
    //extensions 那些后缀可以省略
    extensions: ['.js', '.css', '.vue']
  },
  plugins: [
    new webpack.BannerPlugin(`bill版权所有`),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    //压缩打包会将注释空格都删除
    // new UglifyjsWebpackPlugin()
  ],
  devServer: {
    contentBase: './dist',
    inline: true
  }
}
