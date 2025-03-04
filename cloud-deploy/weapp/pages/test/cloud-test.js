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
      this.addTestResult('错误分析', '云环境初始化失败，请检查云环境ID是否正确，确保不包含prod-前缀');
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
        'content-type': 'application/json'
      },
      success: res => {
        this.addTestResult('GET请求', `成功: ${JSON.stringify(res.data)}`);
        
        // 再尝试POST请求
        this.testPostRequest();
      },
      fail: err => {
        this.addTestResult('GET请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        
        // 提供错误代码解释
        if (err.errCode === -501000) {
          this.addTestResult('错误分析', '无效的主机配置 (INVALID_HOST)，请检查以下配置：');
          this.addTestResult('1. 云环境ID', `当前值: ${this.data.cloudEnv}，确保不包含prod-前缀`);
          this.addTestResult('2. 区域配置', `当前值: ${this.data.region}，确保与云环境区域一致`);
          this.addTestResult('3. 域名配置', '确保已在微信公众平台添加云托管域名到合法域名列表');
        } else if (err.errCode === -502000) {
          this.addTestResult('错误分析', '服务名称无效 (INVALID_SERVICE)，请检查以下配置：');
          this.addTestResult('1. 服务名称', `当前值: ${this.data.serviceName}，确保与云托管控制台一致`);
          this.addTestResult('2. 服务状态', '确保服务已部署且正在运行');
        } else {
          // 尝试POST请求
          this.testPostRequest();
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
        'content-type': 'application/json'
      },
      success: res => {
        this.addTestResult('POST请求', `成功: ${JSON.stringify(res.data)}`);
        this.setData({ isLoading: false });
      },
      fail: err => {
        this.addTestResult('POST请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.setData({ isLoading: false });
        
        // 如果GET和POST都失败，尝试使用HTTP请求
        this.testHttpRequest();
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  // 测试HTTP请求
  testHttpRequest: function() {
    this.addTestResult('HTTP请求', '开始');
    
    wx.request({
      url: this.data.apiBaseUrl + '/api/count',
      method: 'GET',
      success: res => {
        this.addTestResult('HTTP请求', `成功: ${JSON.stringify(res.data)}`);
      },
      fail: err => {
        this.addTestResult('HTTP请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        
        // 提供错误解决建议
        if (err.errMsg.includes('timeout')) {
          this.addTestResult('错误分析', '请求超时，可能是服务未启动或网络问题');
        } else if (err.errMsg.includes('fail domain')) {
          this.addTestResult('错误分析', '域名解析失败，请检查域名配置和网络连接');
        }
      }
    });
  },
  
  // 清空测试结果
  clearResults: function() {
    this.setData({
      testResults: []
    });
  },
  
  // 添加测试结果
  addTestResult: function(title, content) {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    
    this.setData({
      testResults: [{
        title,
        content,
        time: `下午${time}`
      }, ...this.data.testResults]
    });
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
      success: function() {
        wx.showToast({
          title: '配置信息已复制',
          icon: 'success'
        });
      }
    });
  },
  
  // 直接启动服务
  startService: function() {
    this.addTestResult('启动服务', '尝试通过API调用启动服务...');
    
    // 发送一个简单的GET请求来触发服务启动
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',  // 使用一个轻量级的API端点
      method: 'GET',
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json'
      },
      success: res => {
        this.addTestResult('启动服务', `服务已成功响应: ${JSON.stringify(res.data)}`);
        this.addTestResult('服务状态', '服务已启动并正常运行');
      },
      fail: err => {
        // 即使请求失败也可能触发了服务启动
        this.addTestResult('启动服务', `请求已发送，但服务可能仍在启动中: ${err.errMsg || JSON.stringify(err)}`);
        this.addTestResult('提示', '服务启动可能需要1-2分钟，请稍后重试');
        
        // 如果是超时错误，可能表示服务正在启动中
        if (err.errMsg && err.errMsg.includes('timeout')) {
          this.addTestResult('分析', '收到超时响应，这通常表示服务正在启动中，请等待1-2分钟后重试');
        }
      },
      complete: () => {
        // 无论成功失败，都尝试使用普通HTTP请求再次触发
        this.triggerServiceWithHttp();
      }
    });
  },
  
  // 使用普通HTTP请求触发服务启动（备用方法）
  triggerServiceWithHttp: function() {
    this.addTestResult('备用启动方法', '尝试使用HTTP请求触发服务启动...');
    
    wx.request({
      url: this.data.apiBaseUrl + '/api/count',
      method: 'GET',
      success: res => {
        this.addTestResult('HTTP请求', `成功: ${JSON.stringify(res.data)}`);
        this.addTestResult('服务状态', '服务已通过HTTP请求成功响应');
      },
      fail: err => {
        this.addTestResult('HTTP请求', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.addTestResult('提示', '服务可能仍在启动中，请稍后重试');
      }
    });
  },
  
  // 自动检测服务状态
  checkServiceStatus: function() {
    this.addTestResult('检测服务状态', '开始');
    
    wx.cloud.callContainer({
      config: {
        env: this.data.cloudEnv
      },
      path: '/api/count',
      method: 'GET',
      header: {
        'X-WX-SERVICE': this.data.serviceName,
        'content-type': 'application/json'
      },
      success: res => {
        this.addTestResult('服务状态', '服务已启动并正常运行');
        this.setData({ isServiceRunning: true });
      },
      fail: err => {
        this.addTestResult('服务状态', '服务未启动或异常');
        this.setData({ isServiceRunning: false });
        
        // 如果服务未启动，尝试启动服务
        if (err.errCode === -501000 || err.errCode === -502000) {
          this.startService();
        }
      }
    });
  }
});
