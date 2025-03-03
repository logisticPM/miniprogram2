/**
 * 配置文件
 * 包含API基础URL和其他配置项
 */

/**
* +----------------------------------------------------------------------
* | 房产小程序 - 微信云托管版
* +----------------------------------------------------------------------
*/

// 是否为开发环境
const isDev = true; // 设置为true启用开发环境

// 云开发环境配置
const config = {
  // 使用云开发时，apiBaseUrl可以为空，因为路径直接在请求中指定
  apiBaseUrl: '',
  env: isDev ? 'development' : 'production',
  // 从微信云托管控制台获取的环境ID
  cloudEnv: '0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z', // 使用控制台日志中显示的实际环境ID
  // 从微信云托管控制台获取的服务名称
  serviceName: 'wxcloudrun-springboot', // 使用您的实际服务名称
  // 基础库最低版本要求
  minLibVersion: '2.23.0',
  // 是否启用本地调试日志
  enableDebugLog: true,
  // 是否使用云托管容器调用（绕过域名限制）
  useCloudContainer: true
};

// 计算API主机地址（用于普通HTTP请求）
config.apiHost = `https://${config.serviceName}-${config.cloudEnv}.ap-shanghai.app.tcloudbase.com`;

// 检查基础库版本
const checkBaseLibVersion = () => {
  // 使用推荐的API替代已弃用的wx.getSystemInfoSync
  const systemInfo = wx.getSystemInfoSync();
  const version = systemInfo.SDKVersion;

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