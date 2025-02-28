/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/
const request = require('../utils/request');
const config = require('../config');

/**
 * 用户服务
 * 提供用户相关的API调用和本地存储操作
 */
const userService = {
  /**
   * 获取用户信息
   * @returns {Object|null} - 返回用户信息，如果未登录则返回null
   */
  getUserInfo: function() {
    return wx.getStorageSync('userInfo') || null;
  },

  /**
   * 保存用户信息
   * @param {Object} userInfo - 用户信息
   */
  setUserInfo: function(userInfo) {
    wx.setStorageSync('userInfo', userInfo);
  },

  /**
   * 清除用户信息
   */
  clearUserInfo: function() {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  },

  /**
   * 检查用户是否已登录
   * @returns {Boolean} - 是否已登录
   */
  isLoggedIn: function() {
    return !!this.getUserInfo();
  },

  /**
   * 微信登录
   * @param {Object} data - 登录参数
   * @returns {Promise} - 返回Promise对象
   */
  wxLogin: function(data) {
    return request.post('/api/customer/bindWechat', data)
      .then(res => {
        if (res.code === 0 && res.data) {
          // 保存用户信息和token
          this.setUserInfo(res.data);
          wx.setStorageSync('token', res.data.token);
        }
        return res;
      });
  },

  /**
   * 验证邀请码
   * @param {String} inviteCode - 邀请码
   * @returns {Promise} - 返回Promise对象
   */
  verifyInviteCode: function(inviteCode) {
    return request.post('/api/customer/verifyInviteCode', { inviteCode });
  },

  /**
   * 发送短信验证码
   * @param {String} phone - 手机号
   * @returns {Promise} - 返回Promise对象
   */
  sendSmsCode: function(phone) {
    return request.post('/api/customer/generateSmsCode', { phone });
  },

  /**
   * 验证短信验证码
   * @param {String} phone - 手机号
   * @param {String} smsCode - 短信验证码
   * @returns {Promise} - 返回Promise对象
   */
  verifySmsCode: function(phone, smsCode) {
    return request.post('/api/customer/verifySmsCode', { phone, smsCode });
  },

  /**
   * 根据openid获取用户信息
   * @param {String} openid - 微信openid
   * @returns {Promise} - 返回Promise对象
   */
  getCustomerByOpenid: function(openid) {
    return request.get(`${config.apiBaseUrl}/api/customers/openid/${openid}`);
  },

  /**
   * 获取微信用户信息
   * @returns {Promise} - 返回Promise对象，包含用户信息
   */
  getWxUserInfo: function() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
};

module.exports = userService; 