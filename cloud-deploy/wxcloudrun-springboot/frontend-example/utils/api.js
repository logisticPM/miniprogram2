// 微信云托管服务地址
const BASE_URL = 'https://your-service-url.ap-shanghai.run.tcloudbase.com';

/**
 * 封装请求方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @returns {Promise} - 返回Promise对象
 */
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取活动列表
 * @returns {Promise} - 返回Promise对象
 */
const getActivityList = () => {
  return request('/api/activity/list');
};

/**
 * 获取活动详情
 * @param {number} activityId - 活动ID
 * @returns {Promise} - 返回Promise对象
 */
const getActivityDetail = (activityId) => {
  return request(`/api/activity/${activityId}`);
};

/**
 * 验证活动密码
 * @param {number} activityId - 活动ID
 * @param {string} password - 活动密码
 * @returns {Promise} - 返回Promise对象
 */
const verifyActivityPassword = (activityId, password) => {
  return request('/api/activity/verify', 'POST', {
    activityId,
    password
  });
};

/**
 * 获取活动房间列表
 * @param {number} activityId - 活动ID
 * @returns {Promise} - 返回Promise对象
 */
const getRoomList = (activityId) => {
  return request(`/api/activity/${activityId}/rooms`);
};

/**
 * 抢购房间
 * @param {number} activityId - 活动ID
 * @param {array} roomIds - 房间ID数组
 * @param {string} phoneNumber - 手机号
 * @param {string} password - 活动密码
 * @returns {Promise} - 返回Promise对象
 */
const grabRooms = (activityId, roomIds, phoneNumber, password) => {
  return request('/api/activity/grab', 'POST', {
    activityId,
    roomIds,
    phoneNumber,
    password
  });
};

/**
 * 获取用户抢购记录
 * @param {string} phoneNumber - 手机号
 * @returns {Promise} - 返回Promise对象
 */
const getUserRecord = (phoneNumber) => {
  return request(`/api/activity/record/${phoneNumber}`);
};

module.exports = {
  getActivityList,
  getActivityDetail,
  verifyActivityPassword,
  getRoomList,
  grabRooms,
  getUserRecord
};
