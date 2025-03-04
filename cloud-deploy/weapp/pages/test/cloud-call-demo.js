// pages/test/cloud-call-demo.js
const app = getApp();
const env = require('../../env');
const cloudContainer = require('../../utils/cloud-container');

Page({
  data: {
    cloudEnv: env.cloudEnv || '未配置',
    serviceName: env.serviceName || '未配置',
    apiBaseUrl: env.apiBaseUrl || '未配置',
    callPath: '/api/count',
    callMethod: 'GET',
    callData: '',
    callOptions: '',
    requestResult: '',
    successMessage: '',
    errorMessage: '',
    loading: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    selectedMethod: 0
  },

  onLoad() {
    // 显示环境信息
    this.setData({
      cloudEnv: env.cloudEnv || '未配置',
      serviceName: env.serviceName || '未配置',
      apiBaseUrl: env.apiBaseUrl || '未配置',
      // 设置默认测试路径
      callPath: '/api/count',
      callMethod: 'GET',
      callData: '',
      callOptions: ''
    });
  },

  // 输入框内容变化处理
  onPathInput(e) {
    this.setData({
      callPath: e.detail.value
    });
  },

  onMethodChange(e) {
    this.setData({
      selectedMethod: e.detail.value,
      callMethod: this.data.methods[e.detail.value]
    });
  },

  onDataInput(e) {
    this.setData({
      callData: e.detail.value
    });
  },

  onOptionsInput(e) {
    this.setData({
      callOptions: e.detail.value
    });
  },

  // 测试云托管调用
  testCloudCall() {
    this.setData({
      loading: true,
      successMessage: '',
      errorMessage: '',
      requestResult: ''
    });

    try {
      // 解析输入的数据
      let data = {};
      try {
        data = this.data.callData ? JSON.parse(this.data.callData) : {};
      } catch (e) {
        throw new Error('请求数据格式错误，请输入有效的JSON');
      }

      // 解析选项
      let options = {};
      try {
        options = this.data.callOptions ? JSON.parse(this.data.callOptions) : {};
      } catch (e) {
        console.warn('选项格式错误，将使用默认值');
      }

      // 确保路径以/开头
      const path = this.data.callPath.startsWith('/') ? this.data.callPath : `/${this.data.callPath}`;

      // 调用云托管服务
      wx.cloud.callContainer({
        config: {
          env: env.cloudEnv
        },
        path,
        method: this.data.callMethod,
        data,
        header: {
          'X-WX-SERVICE': env.serviceName,
          'content-type': 'application/json',
          'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token',
          ...options.header
        },
        success: (res) => {
          this.setData({
            requestResult: JSON.stringify(res.data, null, 2),
            successMessage: '云托管调用成功',
            loading: false
          });
        },
        fail: (error) => {
          this.setData({
            errorMessage: `调用失败: ${error.errMsg || error}`,
            loading: false
          });
        }
      });
    } catch (error) {
      console.error('[ERROR] 云托管调用失败:', error);
      this.setData({
        errorMessage: error.message || '调用失败',
        loading: false
      });
    }
  },

  // 使用旧方法调用API（用于比较）
  testOldApiCall() {
    this.setData({
      loading: true,
      successMessage: '',
      errorMessage: '',
      requestResult: ''
    });

    try {
      // 解析输入的数据
      let data = {};
      try {
        data = this.data.callData ? JSON.parse(this.data.callData) : {};
      } catch (e) {
        throw new Error('请求数据格式错误，请输入有效的JSON');
      }

      // 确保路径以/开头
      const path = this.data.callPath.startsWith('/') ? this.data.callPath : `/${this.data.callPath}`;

      // 使用cloudContainer模块调用
      cloudContainer.callContainer({
        path: path,
        method: this.data.callMethod,
        data: data,
        headers: {}
      })
      .then(result => {
        this.setData({
          requestResult: JSON.stringify(result, null, 2),
          successMessage: 'API调用成功（使用cloudContainer）',
          loading: false
        });
      })
      .catch(error => {
        this.setData({
          errorMessage: `调用失败: ${error.message || JSON.stringify(error)}`,
          loading: false
        });
      });
    } catch (error) {
      console.error('[ERROR] API调用失败:', error);
      this.setData({
        errorMessage: error.message || '调用失败',
        loading: false
      });
    }
  },

  // 复制结果到剪贴板
  copyResult() {
    if (!this.data.requestResult) {
      wx.showToast({
        title: '没有可复制的内容',
        icon: 'none'
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.requestResult,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 清空结果
  clearResult() {
    this.setData({
      requestResult: '',
      successMessage: '',
      errorMessage: ''
    });
  }
});
