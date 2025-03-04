/**
 * 环境配置文件
 * 用于在本地开发和云环境之间切换
 */

// 环境类型：development 或 production
const ENV_TYPE = 'production';

// 各环境配置
const ENV_CONFIG = {
  development: {
    // 云环境ID
    cloudEnv: '0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z',
    // 云托管服务名称
    serviceName: 'wxcloudrun-springboot',
    // API基础URL
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
    // 云环境ID - 注意不要包含prod-前缀
    cloudEnv: '0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z',
    // 云托管服务名称
    serviceName: 'springboot',
    // API基础URL - 使用备用测试域名
    apiBaseUrl: 'https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com',
    // 备用测试域名（仅用于测试，不可用于正式环境）
    testApiBaseUrl: 'https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com',
    // 内网访问地址（仅在云托管环境内使用）
    internalApiBaseUrl: 'http://cdmoyuli.springboot-uc65.jpz1lqiu.l9g8gc3b.com',
    // 调试模式
    debug: true, // 临时开启调试模式以查看错误信息
    // 环境名称
    envName: 'production',
    // 最低SDK版本
    minLibVersion: '2.23.0',
    // 是否启用调试日志
    enableDebugLog: true, // 临时开启调试日志以查看错误信息
    // 是否使用云容器
    useCloudContainer: true,
    // 云存储配置
    storage: {
      bucket: '7072-prod-4gqa4n181c615ff2-1322503328',
      region: 'ap-shanghai'
    },
    // 数据库配置（仅供参考，实际在后端使用）
    database: {
      host: '10.48.100.162',
      port: 3306,
      username: 'root',
      password: 'uNvv89FG'
    },
    // 容器规格
    container: {
      cpu: 1,
      memory: 2,
      minReplicas: 0,
      maxReplicas: 5,
      scaleThresholds: {
        cpu: 50,
        memory: 50
      }
    },
    // 云服务配置
    cloudConfig: {
      cpu: '1核',
      memory: '2G',
      minInstances: 0,
      maxInstances: 5,
      scaleConditions: {
        cpu: '≥50%',
        memory: '≥50%'
      }
    }
  }
};

// 当前环境配置
const currentEnv = ENV_CONFIG[ENV_TYPE];

module.exports = {
  ENV_TYPE,
  ...currentEnv
};
