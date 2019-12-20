const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 				// 打包关联html文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");		// css提取到一个文件
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');		// css压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const glob = require("glob");
const entrys = {}; 															// 动态添加入口文件
const htmlCfgs = []; 														// 动态添加入口文件Plugins配置
const htmls = glob.sync('src/views/*.html');	 							// 扫描出入口页面模板的路径
htmls.forEach((filePath) => {
	let path = filePath.split('/');
    let file = path.pop();
    let name = file.split('.')[0];
    entrys[name] = './src/' + name + '.js'; 
    htmlCfgs.push( 													
        new HtmlWebpackPlugin({	
    	 	filename: file,
            template: filePath,
            inject: 'body',
            chunks: [name, 'common', 'vendor']
        }),
    )
})
htmlCfgs.push(							// 添加所有需要用到的plugins
	new MiniCssExtractPlugin({
		filename: './static/css/[name].[hash:8].css',
	})
)

module.exports = {
	entry: entrys,
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: process.env.NODE_ENV === 'production' ? 'static/js/bundle.[chunkhash].js' : 'static/js/bundle.js',
		chunkFilename: process.env.NODE_ENV === 'production' ? 'static/js/[name].[chunkhash].js' : 'static/js/[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(png|svg|jpg|gif)$/, 
				use: [{
					loader: 'url-loader',
					options: {
						limit: 8192,
						name: './static/images/[name].[hash:7].[ext]',
					}
				}]
			},{
				test: /\.html$/, 
				use: [{
		            loader: "html-loader",
		            options: { minimize: false }
		    	}]
			},{
		        test: /\.css$/,
		        use: [
		        	{
					    loader: MiniCssExtractPlugin.loader,
					    options: {
					      	publicPath: '../../' 
					    }
					},
		        	"css-loader",
		        	'postcss-loader'
		        ]
		  	},{
	            test: /\.less$/,
	            use: [
					{
					    loader: MiniCssExtractPlugin.loader,
					    options: {
					      	publicPath: '../../' 
					    }
					},
					'css-loader',
					'less-loader',
		        	'postcss-loader'
		        ],
	        },{
		  		test: /\.(woff2|woff|eot|ttf|otf)(\?.*)?$/,
		  		loader: 'url-loader',
		  		options: {
				    limit: 10000,
				    name: 'static/fonts/[name].[hash:8].[ext]',
				}
		  	}, {
				test:/\.js$/,
				exclude:/node_modules/,
				use:'babel-loader'
		    },{
			    test: /\.(vue|js)$/,
			    loader: 'eslint-loader',
			    exclude: /node_modules/,
			    enforce: 'pre'
			},
		]
	},

	plugins: htmlCfgs,

	resolve: {
        alias: {
            'vue': 'vue/dist/vue.js',
            '@': path.resolve(__dirname,'./src'),			// 别名：js文件中使用‘@’代替‘./src’，html、css需用‘~@’
        }
    },

    optimization: {
    	// minimize: process.env.NODE_ENV === 'production' ? true : false,		// 兼容IOS10版本在混淆压缩下的白屏问题--“参数与方法不能同名（如 e (e) {}）”
    	minimizer: [
			new UglifyJsPlugin({
			    sourceMap: process.env.NODE_ENV === "development",
			    parallel: 4,
			    uglifyOptions: {
			        keep_classnames: true,
			        keep_fnames: true
			    }
			})
    	],
	    splitChunks: {
	        cacheGroups: {
	            vendor:{				
	                chunks:"all",
	                test: /[\\/]node_modules[\\/]/,
	                name:"vendor",
	                minChunks: 1, 			
	                maxInitialRequests: 5,
	                minSize: 0,
	                priority:100,
	                // enforce: true?
	            },
	            common: {				
	                chunks:"all",
	                test:/[\\/]src[\\/]static[\\/]js[\\/]/,		
	                name: "common", 				
	                minChunks: 1,
	                maxInitialRequests: 5,
	                minSize: 0,
	                priority:1
	            }
	        }
	    },
	},
}


