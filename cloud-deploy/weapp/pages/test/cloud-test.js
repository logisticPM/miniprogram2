// pages/test/cloud-test.js
const config = require('../../config');
const env = require('../../env');
const cloudContainer = require('../../utils/cloud-container');

Page({
  data: {
    cloudEnv: env.cloudEnv || '未配置',
    serviceName: env.serviceName || '未配置',
    apiBaseUrl: env.apiBaseUrl || '未配置',
    useCloudContainer: env.useCloudContainer || false,
    sdkVersion: wx.getSystemInfoSync().SDKVersion || '未知',
    testResults: [],
    isLoading: false,
    errorMessage: '',
    showTroubleshooting: false,
    cloudLimits: {
      maxTimeout: 15000, // 15秒超时限制
      maxRequestSize: 100 * 1024 // 100K请求大小限制
    },
    internalApiBaseUrl: env.internalApiBaseUrl || '未配置'
  },

  onLoad(options) {
    // 显示当前配置
    this.setData({
      cloudEnv: env.cloudEnv || '未配置',
      serviceName: env.serviceName || '未配置',
      apiBaseUrl: env.apiBaseUrl || '未配置',
      useCloudContainer: env.useCloudContainer || false,
      sdkVersion: wx.getSystemInfoSync().SDKVersion || '未知',
      internalApiBaseUrl: env.internalApiBaseUrl || '未配置'
    });

    // 自动检测服务状态
    this.checkServiceStatus();
  },

  // 测试云环境初始化
  testCloudInit() {
    this.setData({ isLoading: true });
    this.addTestResult('测试云环境初始化', '开始');

    try {
      // 初始化云环境
      wx.cloud.init({
        env: this.data.cloudEnv,
        traceUser: true
      });
      
      this.addTestResult('云环境初始化', '成功');
      this.setData({ isLoading: false });
      
      // 显示成功提示
      wx.showToast({
        title: '云环境初始化成功',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      this.addTestResult('云环境初始化', `失败: ${error.message || JSON.stringify(error)}`);
      this.setData({ isLoading: false });
      
      // 显示错误信息
      wx.showModal({
        title: '云环境初始化失败',
        content: `错误信息: ${error.message || JSON.stringify(error)}`,
        showCancel: false
      });
    }
  },

  // 测试云托管调用
  testCloudCall() {
    this.setData({ isLoading: true });
    this.addTestResult('测试云托管调用', '开始');
    
    try {
      // 确保云环境已初始化
      try {
        wx.cloud.init({
          env: this.data.cloudEnv,
          traceUser: true
        });
      } catch (error) {
        console.warn('云环境初始化警告:', error);
        // 继续执行，不阻止后续调用
      }
      
      // 调用云托管服务
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
        timeout: 10000, // 设置10秒超时，小于微信限制的15秒
        success: res => {
          this.addTestResult('云托管调用', `成功: ${JSON.stringify(res.data)}`);
          this.setData({ isLoading: false });
          
          // 显示成功提示
          wx.showToast({
            title: '云托管调用成功',
            icon: 'success',
            duration: 2000
          });
        },
        fail: err => {
          this.addTestResult('云托管调用', `失败: ${err.errMsg || JSON.stringify(err)}`);
          this.setData({ isLoading: false });
          
          // 检查错误类型并提供具体建议
          if (err.errMsg && err.errMsg.includes('invalid host')) {
            this.setData({
              errorMessage: '云环境ID格式错误，请检查env.js中的cloudEnv配置',
              showTroubleshooting: true
            });
            
            // 显示错误信息和建议
            wx.showModal({
              title: '云托管调用失败',
              content: '无效的主机名(Invalid host)，请检查云环境ID配置。当前环境ID: ' + this.data.cloudEnv,
              showCancel: false
            });
          } else if (err.errCode === -504000 || (err.errMsg && err.errMsg.includes('timeout'))) {
            this.setData({
              errorMessage: '请求超时，服务可能未启动或正在启动中，请点击"启动服务"按钮。注意：小程序云托管请求超时限制为15秒。',
              showTroubleshooting: true
            });
            
            // 显示错误信息和建议
            wx.showModal({
              title: '云托管调用超时',
              content: '服务可能未启动或正在启动中，请点击"启动服务"按钮，等待1-2分钟后再次尝试。注意：小程序云托管请求超时限制为15秒，请确保后端处理逻辑不超过此限制。',
              showCancel: false
            });
          } else {
            this.setData({
              errorMessage: `云托管调用失败: ${err.errMsg || JSON.stringify(err)}`,
              showTroubleshooting: true
            });
          }
        }
      });
    } catch (error) {
      this.addTestResult('云托管调用', `错误: ${error.message || JSON.stringify(error)}`);
      this.setData({ isLoading: false });
      
      // 显示错误信息
      wx.showModal({
        title: '云托管调用异常',
        content: `错误信息: ${error.message || JSON.stringify(error)}`,
        showCancel: false
      });
    }
  },

  // 测试内网访问
  testInternalAccess() {
    this.setData({ isLoading: true });
    this.addTestResult('测试内网访问', '开始测试内网访问');
    
    if (!this.data.internalApiBaseUrl) {
      this.addTestResult('测试内网访问', '内网地址未配置，请在env.js中设置internalApiBaseUrl');
      this.setData({ isLoading: false });
      return;
    }
    
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
      timeout: 10000, // 设置10秒超时，小于微信限制的15秒
      success: res => {
        this.addTestResult('测试内网访问', `成功: ${JSON.stringify(res.data)}`);
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showToast({
          title: '内网访问成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: err => {
        this.addTestResult('测试内网访问', `失败: ${err.errMsg || JSON.stringify(err)}`);
        this.setData({ isLoading: false });
        
        // 检查错误类型并提供具体建议
        if (err.errMsg && err.errMsg.includes('invalid host')) {
          this.setData({
            errorMessage: '云环境ID格式错误，请检查env.js中的cloudEnv配置',
            showTroubleshooting: true
          });
          
          // 显示错误信息和建议
          wx.showModal({
            title: '内网访问失败',
            content: '无效的主机名(Invalid host)，请检查云环境ID配置。当前环境ID: ' + this.data.cloudEnv,
            showCancel: false
          });
        } else if (err.errCode === -504000 || (err.errMsg && err.errMsg.includes('timeout'))) {
          this.setData({
            errorMessage: '请求超时，服务可能未启动或正在启动中，请点击"启动服务"按钮。注意：小程序云托管请求超时限制为15秒。',
            showTroubleshooting: true
          });
          
          // 显示错误信息和建议
          wx.showModal({
            title: '内网访问超时',
            content: '服务可能未启动或正在启动中，请点击"启动服务"按钮，等待1-2分钟后再次尝试。注意：小程序云托管请求超时限制为15秒，请确保后端处理逻辑不超过此限制。',
            showCancel: false
          });
        } else {
          this.setData({
            errorMessage: `内网访问失败: ${err.errMsg || JSON.stringify(err)}`,
            showTroubleshooting: true
          });
        }
      }
    });
  },

  // 测试POST请求
  testPostRequest() {
    this.setData({ isLoading: true });
    this.addTestResult('测试POST请求', '开始');
    
    // 使用cloudContainer模块发送POST请求
    cloudContainer.post('/api/count', { action: 'inc' })
      .then(result => {
        this.addTestResult('POST请求', `成功: ${JSON.stringify(result)}`);
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showToast({
          title: 'POST请求成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        this.addTestResult('POST请求', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息和排查建议
        this.setData({
          errorMessage: `POST请求失败: ${error.message || JSON.stringify(error)}`,
          showTroubleshooting: true
        });
      });
  },
  
  // 测试HTTP请求
  testHttpRequest: function() {
    this.addTestResult('测试HTTP请求', '开始');
    this.setData({ isLoading: true });
    
    // 使用cloudContainer模块发送GET请求
    cloudContainer.get('/api/count')
      .then(result => {
        this.addTestResult('HTTP请求', `成功: ${JSON.stringify(result)}`);
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showToast({
          title: 'HTTP请求成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        this.addTestResult('HTTP请求', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息
        this.setData({
          errorMessage: `HTTP请求失败: ${error.message || JSON.stringify(error)}`,
          showTroubleshooting: true
        });
      });
  },
  
  // 测试请求大小限制
  testRequestSizeLimit() {
    this.addTestResult('测试请求大小限制', '开始');
    this.setData({ isLoading: true });
    
    // 创建一个大于100K的请求数据
    const largeData = {
      largeString: 'A'.repeat(101 * 1024) // 101KB的字符串
    };
    
    // 使用cloudContainer模块发送POST请求
    cloudContainer.post('/api/count', largeData)
      .then(result => {
        this.addTestResult('大数据请求', `成功: ${JSON.stringify(result)}`);
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showToast({
          title: '大数据请求成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        this.addTestResult('大数据请求', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息
        if (error.code === 'REQUEST_TOO_LARGE') {
          wx.showModal({
            title: '请求数据过大',
            content: '云托管请求大小限制为100K，请减小请求数据大小或使用对象存储处理大文件。',
            showCancel: false
          });
        } else {
          this.setData({
            errorMessage: `大数据请求失败: ${error.message || JSON.stringify(error)}`,
            showTroubleshooting: true
          });
        }
      });
  },

  // 清空测试结果
  clearResults() {
    this.setData({
      testResults: [],
      errorMessage: '',
      showTroubleshooting: false
    });
  },
  
  // 添加测试结果
  addTestResult(title, content) {
    const timestamp = new Date().toLocaleTimeString();
    const newResult = {
      id: Date.now(),
      title: title,
      content: content,
      timestamp: timestamp
    };
    
    // 添加到结果列表
    const testResults = this.data.testResults;
    testResults.unshift(newResult);
    
    this.setData({
      testResults: testResults
    });
  },
  
  // 复制配置信息
  copyConfig() {
    const configInfo = `云环境ID: ${this.data.cloudEnv}
服务名称: ${this.data.serviceName}
API地址: ${this.data.apiBaseUrl}
使用云托管: ${this.data.useCloudContainer ? '是' : '否'}
SDK版本: ${this.data.sdkVersion}
超时限制: ${this.data.cloudLimits.maxTimeout / 1000}秒
请求大小限制: ${this.data.cloudLimits.maxRequestSize / 1024}KB`;
    
    wx.setClipboardData({
      data: configInfo,
      success: () => {
        wx.showToast({
          title: '配置已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  
  // 直接启动服务
  startService() {
    this.setData({ isLoading: true });
    this.addTestResult('启动服务', '开始');
    
    // 使用cloudContainer模块发送GET请求
    cloudContainer.get('/api/count', {}, { timeout: 15000 })
      .then(result => {
        this.addTestResult('启动服务', '成功');
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showModal({
          title: '服务启动成功',
          content: '云托管服务已成功启动，现在可以正常使用云托管功能。',
          showCancel: false
        });
      })
      .catch(error => {
        // 如果是超时错误，可能是服务正在启动中
        if (error.code === 'CLOUD_TIMEOUT_ERROR') {
          this.addTestResult('启动服务', '服务正在启动中，请等待1-2分钟');
          this.setData({ isLoading: false });
          
          wx.showModal({
            title: '服务正在启动',
            content: '云托管服务正在启动中，请等待1-2分钟后再次尝试。冷启动可能需要一些时间，请耐心等待。',
            showCancel: false
          });
        } else {
          this.addTestResult('启动服务', `失败: ${error.message || JSON.stringify(error)}`);
          this.setData({ isLoading: false });
          
          // 显示错误信息
          wx.showModal({
            title: '服务启动失败',
            content: `启动云托管服务失败，请检查服务配置。错误信息: ${error.message || JSON.stringify(error)}`,
            showCancel: false
          });
        }
      });
  },
  
  // 使用普通HTTP请求触发服务启动（备用方法）
  triggerServiceWithHttp() {
    this.setData({ isLoading: true });
    this.addTestResult('HTTP触发服务启动', '开始');
    
    wx.request({
      url: env.apiBaseUrl + '/api/count',
      method: 'GET',
      timeout: 15000,
      success: (res) => {
        this.addTestResult('HTTP触发服务启动', '成功');
        this.setData({ isLoading: false });
        
        // 显示成功提示
        wx.showModal({
          title: '服务启动成功',
          content: '通过HTTP请求成功触发云托管服务启动，现在可以尝试使用云托管功能。',
          showCancel: false
        });
      },
      fail: (err) => {
        // 如果是超时错误，可能是服务正在启动中
        if (err.errMsg && err.errMsg.includes('timeout')) {
          this.addTestResult('HTTP触发服务启动', '服务正在启动中，请等待1-2分钟');
          this.setData({ isLoading: false });
          
          wx.showModal({
            title: '服务正在启动',
            content: '云托管服务正在启动中，请等待1-2分钟后再次尝试。',
            showCancel: false
          });
        } else {
          this.addTestResult('HTTP触发服务启动', `失败: ${err.errMsg || JSON.stringify(err)}`);
          this.setData({ isLoading: false });
          
          // 显示错误信息
          wx.showModal({
            title: '服务启动失败',
            content: `通过HTTP请求触发云托管服务启动失败。错误信息: ${err.errMsg || JSON.stringify(err)}`,
            showCancel: false
          });
        }
      }
    });
  },
  
  // 自动检测服务状态
  checkServiceStatus() {
    this.addTestResult('自动检测服务状态', '开始');
    
    // 使用cloudContainer模块发送GET请求，设置较短的超时时间
    cloudContainer.get('/api/count', {}, { timeout: 5000 })
      .then(result => {
        this.addTestResult('服务状态检测', '服务正常运行中');
        
        // 显示成功提示
        wx.showToast({
          title: '服务正常运行',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        // 如果是超时错误，可能是服务未启动
        if (error.code === 'CLOUD_TIMEOUT_ERROR') {
          this.addTestResult('服务状态检测', '服务可能未启动或正在启动中');
          
          wx.showModal({
            title: '服务未启动',
            content: '云托管服务可能未启动或正在启动中，请点击"启动服务"按钮，等待1-2分钟后再次尝试。',
            confirmText: '启动服务',
            success: (res) => {
              if (res.confirm) {
                this.startService();
              }
            }
          });
        } else if (error.code === 'CLOUD_CONTAINER_ERROR' && error.originalError && error.originalError.errMsg && error.originalError.errMsg.includes('invalid host')) {
          this.addTestResult('服务状态检测', '云环境ID配置错误');
          
          this.setData({
            errorMessage: '云环境ID格式错误，请检查env.js中的cloudEnv配置',
            showTroubleshooting: true
          });
        } else {
          this.addTestResult('服务状态检测', `检测失败: ${error.message || JSON.stringify(error)}`);
        }
      });
  }
});
