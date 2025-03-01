/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/
const app = getApp();
const houseService = require('../../../services/house-service');
const userService = require('../../../services/user-service');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    houses: [],
    loading: true,
    isLoggedIn: false,
    userInfo: null,
    buildingFilter: '',
    statusFilter: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus();
    this.loadHouses();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadHouses();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 检查用户登录状态
  checkLoginStatus: function () {
    const userInfo = userService.getUserInfo();
    this.setData({
      isLoggedIn: !!userInfo,
      userInfo: userInfo
    });
  },

  // 加载房源列表
  loadHouses: function () {
    this.setData({ loading: true });
    
    const { buildingFilter, statusFilter } = this.data;
    
    let promise;
    if (buildingFilter) {
      promise = houseService.getHousesByBuilding(buildingFilter);
    } else if (statusFilter !== null) {
      promise = houseService.getHousesByStatus(statusFilter);
    } else {
      promise = houseService.getAllHouses();
    }
    
    promise
      .then(res => {
        this.setData({
          houses: res.data || [],
          loading: false
        });
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('获取房源列表失败:', err);
        this.setData({
          houses: [],
          loading: false
        });
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      });
  },

  // 按楼号筛选
  filterByBuilding: function (e) {
    const building = e.currentTarget.dataset.building;
    this.setData({
      buildingFilter: building,
      statusFilter: null
    });
    this.loadHouses();
  },

  // 按状态筛选
  filterByStatus: function (e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      statusFilter: status,
      buildingFilter: ''
    });
    this.loadHouses();
  },

  // 清除筛选
  clearFilter: function () {
    this.setData({
      buildingFilter: '',
      statusFilter: null
    });
    this.loadHouses();
  },

  // 查看房源详情
  viewHouseDetail: function (e) {
    const houseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/tonglu/houses/detail?id=${houseId}`
    });
  }
})