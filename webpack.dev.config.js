const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf.js');

module.exports = merge(baseConfig, {
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
        proxy: {
            '/api': {
				// target: 'https://fjhj.bigqiu.shop/wap',
				// changeOrigin: true,
				// pathRewrite: {
				// 	'^/api': '/activity'
				// }
			}
        }
	},

	plugins: [
		
	],
})


