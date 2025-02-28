/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/
const app = getApp();
const activityService = require('../../../services/activity-service');
const userService = require('../../../services/user-service');

Page({
  data: {
    tabs: ['全部活动', '未开始', '进行中', '已结束'],
    activeTab: 0,
    activities: [],
    filteredActivities: [],
    loading: true,
    isLoggedIn: false,
    userInfo: null
  },

  onLoad: function (options) {
    // 检查用户登录状态
    this.checkLoginStatus();
    // 加载活动列表
    this.loadActivities();
  },

  onPullDownRefresh: function () {
    // 下拉刷新
    this.loadActivities();
  },

  onShow: function () {
    // 页面显示时检查登录状态
    this.checkLoginStatus();
  },

  // 检查用户登录状态
  checkLoginStatus: function () {
    const userInfo = userService.getUserInfo();
    this.setData({
      isLoggedIn: !!userInfo,
      userInfo: userInfo
    });
  },

  // 加载活动列表
  loadActivities: function () {
    this.setData({ loading: true });
    
    // 根据当前选中的标签获取不同状态的活动
    let status = null;
    if (this.data.activeTab === 1) {
      status = 0; // 未开始
    } else if (this.data.activeTab === 2) {
      status = 1; // 进行中
    } else if (this.data.activeTab === 3) {
      status = 2; // 已结束
    }
    
    activityService.getActivities(status)
      .then(res => {
        console.log('获取活动列表成功:', res);
        const activities = res.data || [];
        
        // 格式化时间
        const formattedActivities = activities.map(item => ({
          ...item,
          startTimeFormatted: this.formatDateTime(item.startTime),
          endTimeFormatted: this.formatDateTime(item.endTime)
        }));
        
        this.setData({
          activities: formattedActivities,
          filteredActivities: formattedActivities,
          loading: false
        });
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('获取活动列表失败:', err);
        this.setData({
          activities: [],
          filteredActivities: [],
          loading: false
        });
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      });
  },

  // 切换标签
  switchTab: function (e) {
    const index = e.currentTarget.dataset.index;
    if (index !== this.data.activeTab) {
      this.setData({
        activeTab: index
      });
      this.loadActivities();
    }
  },

  // 跳转到活动详情页
  goToActivityDetail: function (e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/tonglu/activities/detail?id=${activityId}`
    });
  },

  // 跳转到登录页
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/tonglu/auth/login'
    });
  },

  // 格式化日期时间
  formatDateTime: function (dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 获取活动状态文本
  getStatusText: function (status) {
    const statusMap = {
      0: '未开始',
      1: '进行中',
      2: '已结束'
    };
    return statusMap[status] || '未知状态';
  }
}); 