// pages/test/cloud-debug/cloud-debug.js
const config = require('../../../config');
const env = require('../../../env');
const cloudContainer = require('../../../utils/cloud-container');

Page({
  data: {
    cloudEnv: env.cloudEnv,
    serviceName: env.serviceName,
    useCloudContainer: env.useCloudContainer,
    apiBaseUrl: env.apiBaseUrl,
    internalApiBaseUrl: env.internalApiBaseUrl || '未配置',
    testResults: [],
    loading: false
  },

  onLoad: function (options) {
    // 页面加载时显示环境配置
    console.log('当前云环境配置:', {
      cloudEnv: env.cloudEnv,
      serviceName: env.serviceName,
      useCloudContainer: env.useCloudContainer,
      apiBaseUrl: env.apiBaseUrl
    });
  },

  // 测试云环境初始化
  async testCloudInit() {
    this.setData({
      loading: true,
      testResults: [...this.data.testResults, {
        name: '云环境初始化',
        status: '测试中...',
        details: '正在初始化云环境...'
      }]
    });

    try {
      if (!wx.cloud) {
        throw new Error('当前微信版本过低，无法使用云能力');
      }

      wx.cloud.init({
        env: env.cloudEnv,
        traceUser: true
      });

      this.updateTestResult('云环境初始化', '成功', `成功初始化云环境: ${env.cloudEnv}`);
    } catch (error) {
      console.error('云环境初始化失败:', error);
      this.updateTestResult('云环境初始化', '失败', `错误信息: ${error.message || error}`);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 测试云托管调用
  async testCloudCall() {
    this.setData({
      loading: true,
      testResults: [...this.data.testResults, {
        name: '云托管调用',
        status: '测试中...',
        details: '正在调用云托管服务...'
      }]
    });

    try {
      // 初始化云环境
      await cloudContainer.initCloud();
      
      // 调用健康检查接口
      const result = await cloudContainer.get('/api/health');
      
      this.updateTestResult('云托管调用', '成功', `调用结果: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('云托管调用失败:', error);
      
      // 检查是否是 Invalid host 错误
      if (error && error.errMsg && error.errMsg.includes('Invalid host')) {
        this.updateTestResult('云托管调用', '失败', 
          `错误: Invalid host (errCode: -501000)\n` +
          `可能原因:\n` +
          `1. 云环境ID配置错误，当前值: ${env.cloudEnv}\n` +
          `2. 云环境ID包含了prod-前缀\n` +
          `3. 没有在微信公众平台添加云托管域名到合法域名列表\n` +
          `建议解决方案:\n` +
          `- 确保env.js中的cloudEnv值正确且不包含prod-前缀\n` +
          `- 当前正确的云环境ID应为: 0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z`
        );
      } else if (error && error.errMsg && error.errMsg.includes('Invalid service')) {
        this.updateTestResult('云托管调用', '失败', 
          `错误: Invalid service (errCode: -502000)\n` +
          `可能原因:\n` +
          `1. 服务名称配置错误，当前值: ${env.serviceName}\n` +
          `2. 该服务不存在或未部署\n` +
          `建议解决方案:\n` +
          `- 确保env.js中的serviceName值正确\n` +
          `- 当前生产环境的服务名称应为: springboot\n` +
          `- 当前开发环境的服务名称应为: wxcloudrun-springboot`
        );
      } else {
        this.updateTestResult('云托管调用', '失败', `错误信息: ${error.message || error.errMsg || JSON.stringify(error)}`);
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  // 测试普通HTTP请求
  async testHttpRequest() {
    this.setData({
      loading: true,
      testResults: [...this.data.testResults, {
        name: 'HTTP请求',
        status: '测试中...',
        details: '正在发送HTTP请求...'
      }]
    });

    try {
      // 使用cloudContainer模块发送HTTP请求
      const result = await cloudContainer.get('/api/health');
      this.updateTestResult('HTTP请求', '成功', `调用结果: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('HTTP请求失败:', error);
      this.updateTestResult('HTTP请求', '失败', `错误信息: ${error.message || JSON.stringify(error)}`);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 测试端口环境变量
  testPortVariable() {
    this.setData({
      testResults: [...this.data.testResults, {
        name: '端口环境变量检查',
        status: '信息',
        details: 
          `当前配置信息:\n` +
          `- 云环境ID: ${env.cloudEnv}\n` +
          `- 服务名称: ${env.serviceName}\n` +
          `- API基础URL: ${env.apiBaseUrl}\n` +
          `- 内网访问地址: ${env.internalApiBaseUrl || '未配置'}\n` +
          `- 使用云托管容器调用: ${env.useCloudContainer ? '是' : '否'}\n\n` +
          `端口环境变量说明:\n` +
          `- 在application.yml中，端口配置为: \${PORT:80}\n` +
          `- 这表示使用环境变量PORT的值，如果未设置则默认为80\n` +
          `- 微信云托管会自动设置PORT环境变量\n` +
          `- 本地开发时需要手动设置PORT环境变量或使用默认值`
      }]
    });
  },

  // 清除测试结果
  clearResults() {
    this.setData({ testResults: [] });
  },

  // 更新测试结果
  updateTestResult(name, status, details) {
    const { testResults } = this.data;
    const index = testResults.findIndex(item => item.name === name);
    
    if (index !== -1) {
      testResults[index] = { name, status, details };
      this.setData({ testResults });
    }
  }
});
