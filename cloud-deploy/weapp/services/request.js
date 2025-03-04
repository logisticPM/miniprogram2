// services/request.js
const app = getApp();
const config = require('../config');
const cloudContainer = require('../utils/cloud-container');

/**
 * 封装请求方法
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL
 * @param {string} options.method - 请求方法，默认为GET
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 * @returns {Promise} - 返回Promise对象
 */
function request(options) {
  // 检查用户是否登录
  const userInfo = app ? app.globalData.userInfo : null;
  const header = options.header || {};

  // 如果用户已登录，添加手机号到请求头
  if (userInfo && userInfo.phoneNumber) {
    header['X-Phone-Number'] = userInfo.phoneNumber;
  }

  return new Promise((resolve, reject) => {
    wx.showNavigationBarLoading();
    
    // 确保url以/开头
    const path = options.url.startsWith('/') ? options.url : `/${options.url}`;
    
    // 使用cloudContainer模块调用
    cloudContainer.callContainer({
      path: path,
      method: options.method || 'GET',
      data: options.data || {},
      headers: {
        ...header
      },
      timeout: 60000 // 60秒超时
    })
    .then(result => {
      wx.hideNavigationBarLoading();
      resolve(result);
    })
    .catch(error => {
      wx.hideNavigationBarLoading();
      
      // 处理401未授权错误
      if (error && error.code === 401) {
        // 保存当前页面路径
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const url = currentPage ? currentPage.route : '';
        const redirectUrl = url ? encodeURIComponent(`/${url}`) : '';
        
        // 跳转到登录页
        wx.navigateTo({
          url: `/pages/user/login/login?redirect=${redirectUrl}`
        });
      }
      
      // 显示错误提示
      wx.showToast({
        title: error.message || '请求失败',
        icon: 'none',
        duration: 2000
      });
      
      reject(error);
    });
  });
}

module.exports = {
  request
};
