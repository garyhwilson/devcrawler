const path = require('path')

// Common configuration for both extension and web
const common = {
	mode: 'development',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},
	resolve: {
		extensions: ['.js']
	}
}

// Configuration for VS Code extension
const extensionConfig = {
	...common,
	target: 'node',
	entry: './src/extension.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2'
	},
	externals: {
		vscode: 'commonjs vscode'
	}
}

// Configuration for web/game code
const gameConfig = {
	...common,
	target: 'web',
	entry: './src/game/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'game.js'
	},
	resolve: {
		...common.resolve,
		fallback: {
			path: require.resolve('path-browserify')
		}
	}
}

// Export both configurations
module.exports = [extensionConfig, gameConfig]
