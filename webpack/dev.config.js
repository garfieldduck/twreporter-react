require('babel-polyfill')

// Webpack config for development
var autoprefixer = require('autoprefixer')
var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var helpers = require('./helpers')
var WebpackIsomorphicTools = require('webpack-isomorphic-tools')
var assetsPath = path.resolve(__dirname, '../static/dist')
var host = (process.env.HOST || 'localhost')
var port = parseInt(process.env.PORT) + 1 || 3001
var ExtractTextPlugin = require('extract-text-webpack-plugin')

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin')
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools'))


var babelrc = fs.readFileSync('./.babelrc')
var babelrcObject = {}

try {
  babelrcObject = JSON.parse(babelrc)
} catch (err) {
  console.error('==>     ERROR: Error parsing your .babelrc.')
  console.error(err)
}

var babelrcObjectDevelopment = babelrcObject.env && babelrcObject.env.development || {}

// merge global and dev-only plugins
var combinedPlugins = babelrcObject.plugins || []
combinedPlugins = combinedPlugins.concat(babelrcObjectDevelopment.plugins)

var babelLoaderQuery = Object.assign({}, babelrcObject, babelrcObjectDevelopment, { plugins: combinedPlugins })
delete babelLoaderQuery.env

babelLoaderQuery.presets = babelLoaderQuery.presets.map(function (v) {
  return v === 'es2015' ? [ 'es2015', { modules: false } ] : v
})

var webpackConfig = module.exports = {
  devtool: 'inline-source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    'main': [
      'webpack-hot-middleware/client?path=http://' + host + ':' + port + '/__webpack_hmr',
      'react-hot-loader/patch',
      'bootstrap-loader',
      './src/index.js'
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'http://' + host + ':' + port + '/dist/'
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'happypack/loader?id=jsx',
        include: [ path.resolve(__dirname, '../src') ]
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/font-woff'
        }
      },
      // { test: /\.scss$/,
      //   use: [
      //     {
      //       loader: 'style-loader'
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: true,
      //         importLoaders: 2,
      //         sourceMap: true,
      //         localIdentName: '[name]__[local]___[hash:base64:5]'
      //       }
      //     },
      //     {
      //       loader: 'postcss-loader'
      //     },
      //     {
      //       loader: 'sass-loader'
      //     }
      //   ]
      // },
      {
        test: /\.scss$/,
        loader: 'happypack/loader?id=sass',
        include: [ path.resolve(__dirname, '../src') ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
      },
      {
        test: /\.woff?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/octet-stream'
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'image/svg+xml'
        }
      }, 
      {
        test: webpackIsomorphicToolsPlugin.regular_expression('images'),
        loader: 'url-loader',
        options: {
          limit: 10240
        }
      }
    ]
  },
  postcss: [ autoprefixer ],
  progress: true,
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: [ '.json', '.js', '.jsx' ],
    alias: {
      ScrollMagic: 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'
    }
  },
  plugins: [
    // hot reload
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: true,
        BABEL_ENV: '"DEV"'  // <-------- TO ENABLE react-hot-loader
      },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true  // <-------- DISABLE redux-devtools HERE
    }),
    // css files from the extract-text-plugin loader
    new ExtractTextPlugin('[name].css'),
    webpackIsomorphicToolsPlugin.development(),

    helpers.createHappyPlugin('jsx', [
      {
        loader: 'react-hot-loader/webpack'
      }, {
        loader: 'babel-loader',
        query: babelLoaderQuery
      }, {
        loader: 'eslint-loader'
      }
    ]),
    helpers.createHappyPlugin('sass', [
      {
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        query: {
          modules: true,
          importLoaders: 3,
          sourceMap: true,
          localIdentName: '[local]___[hash:base64:5]'
        }
      }, {
        loader: 'autoprefixer-loader',
        query: {
          browsers: 'last 2 version'
        }
      }, {
        loader: 'resolve-url-loader'
      }, {
        loader: 'sass-loader',
        query: {
          outputStyle: 'expanded',
          sourceMap: true
        }
      },
      {
        loader: 'postcss-loader'
      }
    ])
  ]
}
