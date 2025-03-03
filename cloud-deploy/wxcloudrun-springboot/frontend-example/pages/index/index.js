// 引入API工具
const api = require('../../utils/api');

Page({
  data: {
    activityList: [],
    loading: true,
    error: null
  },

  onLoad: function() {
    this.fetchActivityList();
  },

  onPullDownRefresh: function() {
    this.fetchActivityList();
  },

  /**
   * 获取活动列表
   */
  fetchActivityList: function() {
    this.setData({
      loading: true,
      error: null
    });

    api.getActivityList()
      .then(res => {
        if (res.code === 0) {
          this.setData({
            activityList: res.data || [],
            loading: false
          });
        } else {
          this.setData({
            error: res.message || '获取活动列表失败',
            loading: false
          });
        }
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('获取活动列表失败', err);
        this.setData({
          error: '网络错误，请稍后重试',
          loading: false
        });
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 跳转到活动详情页
   */
  navigateToActivity: function(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/activity?id=${activityId}`
    });
  },

  /**
   * 跳转到抢房记录页
   */
  navigateToRecord: function() {
    wx.navigateTo({
      url: '/pages/record/record'
    });
  }
});
