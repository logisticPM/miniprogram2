// app.js
const config = require('./config');
const request = require('./utils/request');

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化云环境
    if (wx.cloud) {
      try {
        // 确保环境ID不为空
        if (!config.cloudEnv) {
          throw new Error('云环境ID未配置');
        }

        wx.cloud.init({
          env: config.cloudEnv,
          traceUser: true
        });

        // 输出调试信息
        if (config.env === 'development' && config.enableDebugLog) {
          console.log('[DEBUG] 云环境初始化完成:', config.cloudEnv);
          console.log('[DEBUG] 服务名称:', config.serviceName);
          console.log('[DEBUG] 当前环境:', config.env);
          console.log('[DEBUG] API地址:', config.apiHost);
          console.log('[DEBUG] 使用云托管容器调用:', config.useCloudContainer ? '是' : '否');

          // 测试API连接
          this.testApiConnection();
        }
      } catch (error) {
        console.error('[ERROR] 云环境初始化失败:', error);
        wx.showModal({
          title: '云环境初始化失败',
          content: error.message || '请检查云环境ID配置',
          showCancel: false
        });
      }
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      wx.showModal({
        title: '当前微信版本过低',
        content: '请使用 2.2.3 或以上的基础库以使用云能力',
        showCancel: false
      });
    }

    // 检查基础库版本
    config.checkBaseLibVersion();

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (config.env === 'development' && config.enableDebugLog) {
          console.log('[DEBUG] 微信登录成功，code:', res.code);
        }
      },
      fail: err => {
        console.error('[ERROR] 微信登录失败:', err);
      }
    })
  },

  // 测试API连接
  testApiConnection() {
    // 测试健康检查接口
    const testPath = '/api/health';

    // 如果配置了使用云托管容器调用，直接使用callContainer
    if (config.useCloudContainer) {
      request.callContainer(testPath, 'GET')
        .then(res => {
          console.log('[DEBUG] API连接测试成功:', res);
        })
        .catch(err => {
          console.error('[ERROR] API连接测试失败:', err);

          // 尝试不同的请求方法
          console.log('[DEBUG] 尝试使用POST方法...');
          request.callContainer(testPath, 'POST')
            .then(res => {
              console.log('[DEBUG] POST方法调用成功:', res);
              wx.showToast({
                title: '建议使用POST方法',
                icon: 'none',
                duration: 2000
              });
            })
            .catch(postErr => {
              console.error('[ERROR] POST方法也失败:', postErr);
              wx.showToast({
                title: 'API连接失败，请检查配置',
                icon: 'none',
                duration: 3000
              });
            });
        });
    } else {
      // 使用普通HTTP请求
      request.get(testPath)
        .then(res => {
          console.log('[DEBUG] API连接测试成功:', res);
        })
        .catch(err => {
          console.error('[ERROR] API连接测试失败:', err);

          // 尝试使用云托管容器调用
          console.log('[DEBUG] 尝试使用云托管容器调用...');
          request.callContainer(testPath, 'GET')
            .then(res => {
              console.log('[DEBUG] 云托管容器调用成功:', res);
              // 建议使用云托管容器调用
              wx.showModal({
                title: '提示',
                content: '建议在config.js中启用云托管容器调用以绕过域名限制',
                showCancel: false
              });
            })
            .catch(containerErr => {
              console.error('[ERROR] 云托管容器调用也失败:', containerErr);
              wx.showToast({
                title: 'API连接失败，请检查配置',
                icon: 'none',
                duration: 3000
              });
            });
        });
    }
  },

  globalData: {
    userInfo: null,
    // 添加环境配置信息
    env: config.env,
    // 添加超时配置
    myconfigs: {
      timeout: 0
    }
  }
})
