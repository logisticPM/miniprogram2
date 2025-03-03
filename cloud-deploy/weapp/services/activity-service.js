/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/
const request = require('../utils/request');
const config = require('../config');

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
  getActivities: function(status) {
    const url = status !== undefined ? `/api/grab-activities/status/${status}` : '/api/grab-activities';
    return request.get(url);
  },

  /**
   * 获取当前活动
   * 获取正在进行中的活动
   * @returns {Promise} - 返回Promise对象
   */
  getCurrentActivities: function() {
    return this.getActivities(1); // 状态1表示进行中
  },

  /**
   * 获取活动详情
   * @param {Number} id - 活动ID
   * @returns {Promise} - 返回Promise对象
   */
  getActivityDetail: function(id) {
    return request.get(`/api/grab-activities/${id}`);
  },

  /**
   * 获取活动房源列表
   * @param {Number} activityId - 活动ID
   * @returns {Promise} - 返回Promise对象
   */
  getActivityHouses: function(activityId) {
    return request.get(`/api/grab-activities/${activityId}/houses`);
  },

  /**
   * 抢房
   * @param {Number} activityId - 活动ID
   * @param {Number} houseId - 房源ID
   * @returns {Promise} - 返回Promise对象
   */
  grabHouse: function(activityId, houseId) {
    return request.post('/api/grab', {
      activityId: activityId,
      houseId: houseId
    });
  },

  /**
   * 获取用户抢房记录
   * @param {Number} customerId - 客户ID，不传则获取当前登录用户的记录
   * @returns {Promise} - 返回Promise对象
   */
  getGrabRecords: function(customerId) {
    const url = customerId ? `/api/grab/customer/${customerId}` : '/api/grab/customer';
    return request.get(url);
  },

  /**
   * 获取房源详情
   * @param {Number} houseId - 房源ID
   * @returns {Promise} - 返回Promise对象
   */
  getHouseDetail: function(houseId) {
    return request.get(`${config.apiBaseUrl}/api/houses/${houseId}`);
  }
};

module.exports = activityService; 