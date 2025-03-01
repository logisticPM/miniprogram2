/**
 * 配置文件
 * 包含API基础URL和其他配置项
 */

/**
* +----------------------------------------------------------------------
* | 智慧地产 - 抢房小程序
* +----------------------------------------------------------------------
*/

// 是否为开发环境
const isDev = false; // 切换为true时使用开发环境

// 云开发环境配置
const config = {
  // 使用云开发时，apiBaseUrl可以为空，因为路径直接在请求中指定
  apiBaseUrl: '',
  env: isDev ? 'development' : 'production',
  // 云环境ID，替换为您的实际环境ID
  cloudEnv: isDev ? 'dev-environment-id' : 'prod-4gqa4n181c615ff2',
  // 服务名称，替换为您的实际服务名称
  serviceName: 'springboot-wzdw',
  // 基础库最低版本要求
  minLibVersion: '2.23.0'
};

// 检查基础库版本
const checkBaseLibVersion = () => {
  const version = wx.getSystemInfoSync().SDKVersion;
  if (compareVersion(version, config.minLibVersion) < 0) {
    wx.showModal({
      title: '提示',
      content: `当前微信版本过低，请升级到最新微信版本后重试。需要基础库版本 ${config.minLibVersion} 以上`,
      showCancel: false
    });
    return false;
  }
  return true;
};

// 版本比较函数
const compareVersion = (v1, v2) => {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);
  
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);
    
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  
  return 0;
};

config.checkBaseLibVersion = checkBaseLibVersion;

module.exports = config; 