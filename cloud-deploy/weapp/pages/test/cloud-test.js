// pages/test/cloud-test.js
const config = require('../../config');
const env = require('../../env');
const cloudContainer = require('../../utils/cloud-container');

Page({
  data: {
    cloudEnv: env.cloudEnv || '未配置',
    serviceName: env.serviceName || '未配置',
    apiBaseUrl: env.apiBaseUrl || '未配置',
    testResults: [],
    isLoading: false,
    errorMessage: '',
    showTroubleshooting: false
  },

  onLoad(options) {
    // 显示当前配置
    this.setData({
      cloudEnv: env.cloudEnv || '未配置',
      serviceName: env.serviceName || '未配置',
      apiBaseUrl: env.apiBaseUrl || '未配置'
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
      
      // 获取云环境信息
      this.getCloudEnvInfo()
        .then(info => {
          this.addTestResult('云环境初始化', `成功: ${JSON.stringify(info)}`);
        })
        .catch(error => {
          this.addTestResult('云环境初始化', `失败: ${error.message || JSON.stringify(error)}`);
          
          // 尝试自动修复环境ID格式问题
          if (error.message && error.message.includes('invalid')) {
            const fixedEnv = this.data.cloudEnv.startsWith('prod-') 
              ? this.data.cloudEnv.substring(5) 
              : `prod-${this.data.cloudEnv}`;
              
            this.addTestResult('自动修复', `尝试使用修正后的环境ID: ${fixedEnv}`);
            
            // 使用修正后的环境ID重试
            wx.cloud.init({
              env: fixedEnv,
              traceUser: true
            });
            
            this.getCloudEnvInfo()
              .then(info => {
                this.addTestResult('自动修复', `成功: ${JSON.stringify(info)}`);
              })
              .catch(retryError => {
                this.addTestResult('自动修复', `失败: ${retryError.message || JSON.stringify(retryError)}`);
              });
          }
        })
        .finally(() => {
          this.setData({ isLoading: false });
        });
    } catch (error) {
      this.addTestResult('云环境初始化', `错误: ${error.message || JSON.stringify(error)}`);
      this.setData({ isLoading: false });
    }
  },
  
  // 获取云环境信息
  getCloudEnvInfo() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getEnvInfo',
        success: res => {
          resolve(res.result);
        },
        fail: err => {
          reject(err);
        }
      });
    });
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
        success: res => {
          this.addTestResult('云托管调用', `成功: ${JSON.stringify(res.data)}`);
          this.setData({ isLoading: false });
        },
        fail: err => {
          this.addTestResult('云托管调用', `失败: ${err.errMsg || JSON.stringify(err)}`);
          
          // 检查是否是环境ID格式问题
          if (err.errMsg && err.errMsg.includes('invalid host')) {
            // 尝试自动修复环境ID格式问题
            const fixedEnv = this.data.cloudEnv.startsWith('prod-') 
              ? this.data.cloudEnv.substring(5) 
              : `prod-${this.data.cloudEnv}`;
              
            this.addTestResult('自动修复', `尝试使用修正后的环境ID: ${fixedEnv}`);
            
            // 使用修正后的环境ID重试
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
              success: retryRes => {
                this.addTestResult('自动修复', `成功: ${JSON.stringify(retryRes.data)}`);
                this.setData({ isLoading: false });
              },
              fail: retryErr => {
                this.addTestResult('自动修复', `失败: ${retryErr.errMsg || JSON.stringify(retryErr)}`);
                this.setData({ isLoading: false });
                
                // 尝试使用HTTP请求
                this.testHttpRequest();
              }
            });
          } else {
            this.setData({ isLoading: false });
            
            // 尝试使用HTTP请求
            this.testHttpRequest();
          }
        }
      });
    } catch (error) {
      this.addTestResult('云托管调用', `错误: ${error.message || JSON.stringify(error)}`);
      this.setData({ isLoading: false });
      
      // 尝试使用HTTP请求
      this.testHttpRequest();
    }
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
      })
      .catch(error => {
        this.addTestResult('POST请求', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息和排查建议
        this.setData({
          errorMessage: '所有请求方式均失败，请检查云托管服务是否正常运行',
          showTroubleshooting: true
        });
      });
  },
  
  // 测试HTTP请求
  testHttpRequest: function() {
    this.addTestResult('测试HTTP请求', '开始');
    
    // 使用cloudContainer模块发送GET请求
    cloudContainer.get('/api/count')
      .then(result => {
        this.addTestResult('HTTP请求', `成功: ${JSON.stringify(result)}`);
        this.setData({ isLoading: false });
      })
      .catch(error => {
        this.addTestResult('HTTP请求', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息和排查建议
        this.setData({
          errorMessage: '所有请求方式均失败，请检查云托管服务是否正常运行',
          showTroubleshooting: true
        });
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
    // 获取当前时间
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    
    const newResult = {
      title,
      content,
      time: timeString
    };
    
    this.setData({
      testResults: [newResult, ...this.data.testResults]
    });
  },
  
  // 复制配置信息
  copyConfig() {
    const configInfo = JSON.stringify({
      cloudEnv: this.data.cloudEnv,
      serviceName: this.data.serviceName,
      apiBaseUrl: this.data.apiBaseUrl
    }, null, 2);
    
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
  startService() {
    this.setData({ isLoading: true });
    this.addTestResult('启动服务', '正在尝试启动云托管服务...');
    
    // 使用cloudContainer模块发送请求来触发服务启动
    cloudContainer.get('/api/warm-up')
      .then(result => {
        this.addTestResult('启动服务', `成功: ${JSON.stringify(result)}`);
        this.setData({ 
          isLoading: false,
          errorMessage: '服务已启动，请等待1-2分钟后再次测试云托管调用',
          showTroubleshooting: false
        });
        
        // 显示成功提示
        wx.showToast({
          title: '服务启动成功',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        // 如果warm-up接口不存在，尝试使用count接口
        this.addTestResult('启动服务', `尝试备用方法: ${error.message || JSON.stringify(error)}`);
        
        // 使用count接口作为备选
        this.triggerServiceWithHttp();
      });
  },
  
  // 使用普通HTTP请求触发服务启动（备用方法）
  triggerServiceWithHttp() {
    this.addTestResult('备用启动方法', '正在使用HTTP请求触发服务启动...');
    
    // 使用cloudContainer模块发送请求
    cloudContainer.get('/api/count')
      .then(result => {
        this.addTestResult('备用启动方法', `成功: ${JSON.stringify(result)}`);
        this.setData({ 
          isLoading: false,
          errorMessage: '服务已启动，请等待1-2分钟后再次测试云托管调用',
          showTroubleshooting: false
        });
      })
      .catch(error => {
        this.addTestResult('备用启动方法', `失败: ${error.message || JSON.stringify(error)}`);
        this.setData({ isLoading: false });
        
        // 显示错误信息和排查建议
        this.setData({
          errorMessage: '无法启动服务，请检查云托管配置是否正确',
          showTroubleshooting: true
        });
      });
  },
  
  // 自动检测服务状态
  checkServiceStatus() {
    this.addTestResult('服务状态检测', '正在检测云托管服务状态...');
    
    // 使用cloudContainer模块检测服务状态
    cloudContainer.get('/api/health')
      .then(result => {
        this.addTestResult('服务状态', `正常: ${JSON.stringify(result)}`);
        
        // 显示成功提示
        wx.showToast({
          title: '服务运行正常',
          icon: 'success',
          duration: 2000
        });
      })
      .catch(error => {
        // 检查错误类型
        if (error.errCode === -504000 || (error.message && error.message.includes('timeout'))) {
          // 超时错误，可能是服务未启动
          this.addTestResult('服务状态', '服务未启动或正在启动中');
          this.setData({
            errorMessage: '服务未启动或正在启动中，请点击"启动服务"按钮',
            showTroubleshooting: true
          });
        } else if (error.errCode === -501000 || (error.message && error.message.includes('Invalid host'))) {
          // 环境ID错误
          this.addTestResult('服务状态', '云环境ID格式错误');
          this.setData({
            errorMessage: `云环境ID格式错误: ${this.data.cloudEnv}，请检查配置`,
            showTroubleshooting: true
          });
        } else {
          // 其他错误
          this.addTestResult('服务状态', `异常: ${error.message || JSON.stringify(error)}`);
          this.setData({
            errorMessage: '云托管服务异常，请检查配置',
            showTroubleshooting: true
          });
        }
      });
  }
});
