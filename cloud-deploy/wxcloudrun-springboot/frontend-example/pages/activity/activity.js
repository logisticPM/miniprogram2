// 引入API工具
const api = require('../../utils/api');

Page({
  data: {
    activityId: null,
    activity: null,
    showPasswordDialog: false,
    password: '',
    loading: true,
    error: null,
    verified: false
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        activityId: options.id
      });
      this.fetchActivityDetail(options.id);
    } else {
      this.setData({
        error: '活动ID不存在',
        loading: false
      });
    }
  },

  /**
   * 获取活动详情
   */
  fetchActivityDetail: function(activityId) {
    this.setData({
      loading: true,
      error: null
    });

    api.getActivityDetail(activityId)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            activity: res.data,
            loading: false
          });
        } else {
          this.setData({
            error: res.message || '获取活动详情失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取活动详情失败', err);
        this.setData({
          error: '网络错误，请稍后重试',
          loading: false
        });
      });
  },

  /**
   * 显示密码输入框
   */
  showPasswordInput: function() {
    this.setData({
      showPasswordDialog: true
    });
  },

  /**
   * 关闭密码输入框
   */
  closePasswordInput: function() {
    this.setData({
      showPasswordDialog: false,
      password: ''
    });
  },

  /**
   * 密码输入事件
   */
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 验证活动密码
   */
  verifyPassword: function() {
    const { activityId, password } = this.data;
    
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '验证中...'
    });

    api.verifyActivityPassword(activityId, password)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0 && res.data) {
          this.setData({
            verified: true,
            showPasswordDialog: false
          });
          
          // 跳转到房间选择页
          wx.navigateTo({
            url: `/pages/rooms/rooms?id=${activityId}&password=${password}`
          });
        } else {
          wx.showToast({
            title: '密码错误',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('验证密码失败', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      });
  }
});
