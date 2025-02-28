/**
 * 配置文件
 * 包含API基础URL和其他配置项
 */

/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/

// 开发环境配置
const devConfig = {
  apiBaseUrl: 'http://localhost:8080',
  env: 'development'
};

// 生产环境配置
const prodConfig = {
  apiBaseUrl: 'https://api.tonglumeidi.com',
  env: 'production'
};

// 根据环境选择配置
let isDev = true;
try {
  isDev = __wxConfig.envVersion === 'develop' || __wxConfig.envVersion === 'trial';
} catch (e) {
  console.log('无法获取环境信息，默认使用开发环境配置');
}

const config = isDev ? devConfig : prodConfig;

module.exports = config; 