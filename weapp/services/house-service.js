/**
* +----------------------------------------------------------------------
* | 桐庐美地设计 - 抢房小程序
* +----------------------------------------------------------------------
*/
const request = require('../utils/request');
const config = require('../config');

/**
 * 房源服务
 * 提供房源相关的API调用
 */
const houseService = {
  /**
   * 获取所有房源
   * @returns {Promise} - 返回Promise对象
   */
  getAllHouses: function() {
    return request.get('/api/houses');
  },

  /**
   * 根据楼号查询房源
   * @param {String} buildingNo - 楼号
   * @returns {Promise} - 返回Promise对象
   */
  getHousesByBuilding: function(buildingNo) {
    return request.get(`/api/houses/building/${buildingNo}`);
  },

  /**
   * 根据状态查询房源
   * @param {Number} status - 房源状态：0-可抢，1-已抢
   * @returns {Promise} - 返回Promise对象
   */
  getHousesByStatus: function(status) {
    return request.get(`/api/houses/status/${status}`);
  },

  /**
   * 获取房源详情
   * @param {Number} id - 房源ID
   * @returns {Promise} - 返回Promise对象
   */
  getHouseDetail: function(id) {
    return request.get(`/api/houses/${id}`);
  }
};

module.exports = houseService; 