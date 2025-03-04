/**
* +----------------------------------------------------------------------
* | 房产抢购小程序 - 微信云托管版
* +----------------------------------------------------------------------
*/
const { request } = require('./request');

/**
 * 活动服务
 * 提供抢房活动相关的API调用
 */
const activityService = {
  /**
   * 获取活动列表
   * @param {Number} status - 活动状态：0-未开始，1-进行中，2-已结束，不传则获取全部
   * @returns {Promise} - 返回Promise对象
   */
  getActivities: function (status) {
    return request({
      url: '/api/activity/list',
      method: 'GET',
      data: status ? { status } : {}
    });
  },

  /**
   * 获取当前活动
   * 获取正在进行中的活动
   * @returns {Promise} - 返回Promise对象
   */
  getCurrentActivities: function () {
    return this.getActivities(1); // 1表示进行中
  },

  /**
   * 获取活动详情
   * @param {Number} id - 活动ID
   * @returns {Promise} - 返回Promise对象
   */
  getActivityDetail: function (id) {
    return request({
      url: `/api/activity/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建抢房活动
   * @param {Object} activityData - 活动数据
   * @returns {Promise} - 返回Promise对象
   */
  createActivity: function (activityData) {
    return request({
      url: '/api/activity/create',
      method: 'POST',
      data: activityData
    });
  },

  /**
   * 验证活动密码
   * @param {Object} requestData - 请求数据对象，包含 activityId, password
   * @returns {Promise} - 返回Promise对象
   */
  verifyActivityPassword: function (requestData) {
    return request({
      url: '/api/activity/verify',
      method: 'POST',
      data: requestData
    });
  },

  /**
   * 参与活动
   * @param {Number} activityId - 活动ID
   * @returns {Promise} - 返回Promise对象
   */
  joinActivity: function (activityId) {
    return request({
      url: `/api/activity/${activityId}/join`,
      method: 'POST'
    });
  },

  /**
   * 获取楼号列表
   * @param {Number} activityId - 活动ID
   * @returns {Promise} - 返回Promise对象
   */
  getBuildings: function (activityId) {
    return request({
      url: `/api/activity/${activityId}/buildings`,
      method: 'GET'
    });
  },

  /**
   * 获取楼层列表
   * @param {Number} activityId - 活动ID
   * @param {String} buildingNumber - 楼号
   * @returns {Promise} - 返回Promise对象
   */
  getFloors: function (activityId, buildingNumber) {
    return request({
      url: `/api/activity/${activityId}/building/${buildingNumber}/floors`,
      method: 'GET'
    });
  },

  /**
   * 获取房间列表
   * @param {Number} activityId - 活动ID
   * @param {String} buildingNumber - 楼号
   * @param {Number} floor - 楼层
   * @returns {Promise} - 返回Promise对象
   */
  getRooms: function (activityId, buildingNumber, floor) {
    return request({
      url: `/api/activity/${activityId}/building/${buildingNumber}/floor/${floor}/rooms`,
      method: 'GET'
    });
  },

  /**
   * 获取用户参与的活动列表
   * @returns {Promise} - 返回Promise对象
   */
  getJoinedActivities: function () {
    return request({
      url: '/api/activity/joined',
      method: 'GET'
    });
  },

  /**
   * 验证活动码
   * @param {String} activityCode - 活动码
   * @returns {Promise} - 返回Promise对象
   */
  verifyActivityCode: function (activityCode) {
    return request({
      url: '/api/activity/verify-code',
      method: 'POST',
      data: { activityCode }
    });
  },
  
  /**
   * 获取用户抢房记录
   * @param {String} phoneNumber - 用户手机号
   * @returns {Promise} - 返回Promise对象
   */
  getUserGrabRecords: function (phoneNumber) {
    return request({
      url: `/api/activity/user/${phoneNumber}/records`,
      method: 'GET'
    });
  }
};

module.exports = activityService;