// 引入API工具
const api = require('../../utils/api');

Page({
  data: {
    phoneNumber: '',
    recordList: [],
    loading: false,
    error: null,
    showPhoneInput: true
  },

  /**
   * 手机号输入事件
   */
  onPhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  /**
   * 查询抢房记录
   */
  queryRecord: function() {
    const { phoneNumber } = this.data;
    
    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      loading: true,
      error: null
    });
    
    api.getUserRecord(phoneNumber)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            recordList: res.data || [],
            loading: false,
            showPhoneInput: false
          });
        } else {
          this.setData({
            error: res.message || '获取抢房记录失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取抢房记录失败', err);
        this.setData({
          error: '网络错误，请稍后重试',
          loading: false
        });
      });
  },

  /**
   * 返回查询页面
   */
  backToQuery: function() {
    this.setData({
      showPhoneInput: true,
      recordList: []
    });
  }
});
