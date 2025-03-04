/**
 * 环境配置文件
 * 用于在本地开发和云环境之间切换
 */

// 环境类型：development 或 production
const ENV_TYPE = 'production';

// 各环境配置
const ENV_CONFIG = {
  development: {
    // 云环境ID - 不要包含特殊字符
    cloudEnv: 'prod-0d1hHa0w',
    // 云托管服务名称
    serviceName: 'wxcloudrun-springboot',
    // API基础URL - 仅用于本地开发测试，生产环境使用云托管内网访问
    apiBaseUrl: 'http://localhost:80',
    // 调试模式
    debug: true,
    // 环境名称
    envName: 'development',
    // 最低SDK版本
    minLibVersion: '2.23.0',
    // 是否启用调试日志
    enableDebugLog: true,
    // 是否使用云容器
    useCloudContainer: false
  },
  production: {
    // 云环境ID - 不要包含特殊字符，使用微信云托管控制台显示的正确格式
    cloudEnv: 'prod-0d1hHa0w',
    // 云托管服务名称
    serviceName: 'springboot',
    // 内网访问地址（仅在云托管环境内使用）
    internalApiBaseUrl: 'http://cdmoyuli.springboot-uc65.jpz1lqiu.l9g8gc3b.com',
    // 调试模式
    debug: false, // 生产环境关闭调试模式
    // 环境名称
    envName: 'production',
    // 最低SDK版本
    minLibVersion: '2.23.0',
    // 是否启用调试日志
    enableDebugLog: false, // 生产环境关闭调试日志
    // 是否使用云容器
    useCloudContainer: true,
    // 云存储配置
    storage: {
      // 图片存储路径前缀
      imagePath: 'images/',
      // 文件存储路径前缀
      filePath: 'files/',
      // 临时文件存储路径前缀
      tempPath: 'temp/'
    }
  }
};

// 导出当前环境配置
module.exports = ENV_CONFIG[ENV_TYPE];
