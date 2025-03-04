// pages/test/cloud-test.js
const config = require('../../config');
const env = require('../../env');

Page({
  data: {
    testResults: [],
    cloudEnv: env.cloudEnv || '未配置',
    serviceName: env.serviceName || '未配置',
    apiBaseUrl: env.apiBaseUrl || '未配置',
    useCloudContainer: env.useCloudContainer ? '是' : '否',
    isLoading: false,
    sdkVersion: '',
    libVersion: '',
    region: 'ap-shanghai', // 默认区域
    isServiceRunning: false,
    errorMessage: '',
    showTroubleshooting: false,
    currentStep: 1,
    totalSteps: 4
  },

  onLoad: function (options) {
    // 获取基础库版本
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      sdkVersion: systemInfo.SDKVersion || '未知',
      libVersion: systemInfo.version || '未知'
    });
    
    // 清空测试结果
    this.clearResults();
    
    // 添加环境信息
    this.addTestResult('云环境ID', this.data.cloudEnv);
    this.addTestResult('服务名称', this.data.serviceName);
    this.addTestResult('API基础URL', this.data.apiBaseUrl);
    this.addTestResult('SDK版本', this.data.sdkVersion);
    
    // 自动检测服务状态
    this.checkServiceStatus();
  },

  // 测试云环境初始化
  testCloudInit: function () {
    this.addTestResult('测试云环境初始化', '开始');
    
    try {
      wx.cloud.init({
        env: this.data.cloudEnv,
        traceUser: true
      });
      this.addTestResult('云环境初始化', '成功');
      
      // 获取云环境信息
      this.getCloudEnvInfo();
    } catch (err) {
      this.addTestResult('云环境初始化', `失败: ${err.errMsg || JSON.stringify(err)}`);
      
      // 提供错误解决建议
      this.addTestResult('错误分析', '云环境初始化失败，请检查云环境ID是否正确');
      
      // 尝试使用带prod-前缀的环境ID
      if (!this.data.cloudEnv.startsWith('prod-')) {
        const fixedEnv = `prod-${this.data.cloudEnv}`;
        this.addTestResult('尝试修复', `使用带prod-前缀的环境ID: ${fixedEnv}`);
        
        try {
          wx.cloud.init({
            env: fixedEnv,
            traceUser: true
          });
          this.addTestResult('使用修正环境ID初始化', '成功');
          this.setData({ cloudEnv: fixedEnv });
        } catch (fixErr) {
          this.addTestResult('使用修正环境ID初始化', `失败: ${fixErr.errMsg || JSON.stringify(fixErr)}`);
        }
      }
    }
  },
  
  // 获取云环境信息
  getCloudEnvInfo: function() {
    this.addTestResult('获取云环境信息', '开始');
    
    // 这里可以添加获取云环境信息的代码
    // 由于API限制，这里只是模拟
    const envInfo = {
      region: this.data.region,
      status: '正常'
    };
    
    this.addTestResult('云环境信息', JSON.stringify(envInfo));
  },

  // 测试云托管调用
  testCloudCall: function () {
    this.setData({ isLoading: true });
    this.addTestResult('测试云托管调用', '开始');

    // 先尝试GET请求
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',
      method: 'GET',
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json',
        // 排除不需要的用户凭证信息，提高性能
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
      },
      success: res => {
        this.addTestResult('GET请求', `成功: ${JSON.stringify(res.data)}`);
        
        // 再尝试POST请求
        this.testPostRequest();
      },
      fail: err => {
        this.addTestResult('GET请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        
        // 检查是否是Invalid host错误
        if (err.errMsg && (err.errMsg.includes('invalid host') || err.errMsg.includes('Invalid host'))) {
          this.addTestResult('错误分析', 'Invalid host错误，可能是云环境ID格式问题');
          
          // 尝试使用带prod-前缀的环境ID
          if (!this.data.cloudEnv.startsWith('prod-')) {
            const fixedEnv = `prod-${this.data.cloudEnv}`;
            this.addTestResult('尝试修复', `使用带prod-前缀的环境ID: ${fixedEnv}`);
            
            wx.cloud.callContainer({
              config: {
                env: fixedEnv
              },
              path: '/api/count',
              method: 'GET',
              header: {
                'X-WX-SERVICE': this.data.serviceName,
                'content-type': 'application/json',
                'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
              },
              success: fixRes => {
                this.addTestResult('使用修正环境ID请求', `成功: ${JSON.stringify(fixRes.data)}`);
                this.setData({ cloudEnv: fixedEnv });
                
                // 再尝试POST请求
                this.testPostRequest();
              },
              fail: fixErr => {
                this.addTestResult('使用修正环境ID请求', `失败: ${fixErr.errMsg || JSON.stringify(fixErr)}`);
                
                // 如果仍然失败，尝试使用HTTP请求
                this.testHttpRequest();
              }
            });
          } else {
            // 如果已经包含prod-前缀但仍然失败，尝试使用HTTP请求
            this.testHttpRequest();
          }
        } else {
          // 其他错误，尝试使用HTTP请求
          this.testHttpRequest();
        }
      }
    });
  },

  // 测试POST请求
  testPostRequest: function() {
    this.addTestResult('测试POST请求', '开始');
    
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',
      method: 'POST',
      data: {
        action: 'inc'
      },
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json',
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
      },
      success: res => {
        this.addTestResult('POST请求', `成功: ${JSON.stringify(res.data)}`);
        this.setData({ isLoading: false });
      },
      fail: err => {
        this.addTestResult('POST请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.setData({ isLoading: false });
        
        // 如果POST请求失败，尝试使用HTTP请求
        this.testHttpRequest();
      }
    });
  },

  // 测试HTTP请求
  testHttpRequest: function() {
    this.addTestResult('测试HTTP请求', '开始');
    
    wx.request({
      url: `${this.data.apiBaseUrl}/api/count`,
      method: 'GET',
      success: res => {
        this.addTestResult('HTTP请求', `成功: ${JSON.stringify(res.data)}`);
        this.setData({ isLoading: false });
      },
      fail: err => {
        this.addTestResult('HTTP请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息和排查建议
        this.setData({
          errorMessage: '所有请求方式均失败，请检查云托管服务是否正常运行',
          showTroubleshooting: true
        });
      }
    });
  },

  // 清空测试结果
  clearResults: function() {
    this.setData({
      testResults: [],
      errorMessage: '',
      showTroubleshooting: false
    });
  },

  // 添加测试结果
  addTestResult: function(title, content) {
    const result = {
      title: title,
      content: content,
      time: new Date().toLocaleTimeString()
    };
    
    this.setData({
      testResults: [...this.data.testResults, result]
    });
    
    console.log(`[TEST] ${title}: ${content}`);
  },

  // 复制配置信息
  copyConfig: function() {
    const configInfo = `
云环境ID: ${this.data.cloudEnv}
服务名称: ${this.data.serviceName}
API基础URL: ${this.data.apiBaseUrl}
SDK版本: ${this.data.sdkVersion}
基础库版本: ${this.data.libVersion}
`;
    
    wx.setClipboardData({
      data: configInfo,
      success: () => {
        wx.showToast({
          title: '配置已复制',
          icon: 'success'
        });
      }
    });
  },

  // 直接启动服务
  startService: function() {
    this.setData({ isLoading: true });
    this.addTestResult('启动服务', '开始');
    
    // 尝试使用云托管调用启动服务
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',
      method: 'GET',
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json',
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
      },
      success: res => {
        this.addTestResult('服务启动', '成功');
        this.setData({ 
          isLoading: false,
          isServiceRunning: true
        });
        
        // 更新服务状态
        this.checkServiceStatus();
      },
      fail: err => {
        this.addTestResult('服务启动', `失败: ${err.errMsg || JSON.stringify(err)}`);
        
        // 尝试使用HTTP请求启动服务
        this.triggerServiceWithHttp();
      }
    });
  },

  // 使用普通HTTP请求触发服务启动（备用方法）
  triggerServiceWithHttp: function() {
    this.addTestResult('使用HTTP请求启动服务', '开始');
    
    wx.request({
      url: `${this.data.apiBaseUrl}/api/count`,
      method: 'GET',
      success: res => {
        this.addTestResult('HTTP请求启动服务', '成功');
        this.setData({ 
          isLoading: false,
          isServiceRunning: true
        });
      },
      fail: err => {
        this.addTestResult('HTTP请求启动服务', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.setData({ isLoading: false });
      }
    });
  },

  // 自动检测服务状态
  checkServiceStatus: function() {
    this.addTestResult('检测服务状态', '开始');
    
    // 先尝试使用云托管调用检测服务状态
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',
      method: 'GET',
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json',
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
      },
      success: res => {
        this.addTestResult('服务状态', '运行中');
        this.setData({ isServiceRunning: true });
      },
      fail: err => {
        // 如果云托管调用失败，尝试使用HTTP请求检测
        wx.request({
          url: `${this.data.apiBaseUrl}/api/count`,
          method: 'GET',
          success: res => {
            this.addTestResult('服务状态(HTTP)', '运行中');
            this.setData({ isServiceRunning: true });
          },
          fail: err => {
            this.addTestResult('服务状态', '未运行或无法访问');
            this.setData({ isServiceRunning: false });
          }
        });
      }
    });
  }
});
