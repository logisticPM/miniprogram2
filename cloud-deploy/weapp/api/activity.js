/**
 * 抢房活动相关API
 */
const config = require('../config');
const cloudContainer = require('../utils/cloud-container');

/**
 * 获取活动列表
 */
function getActivities() {
  return cloudContainer.get('/api/activity/list');
}

/**
 * 获取活动详情
 * @param {number} id 活动ID
 */
function getActivityById(id) {
  return cloudContainer.get(`/api/activity/${id}`);
}

/**
 * 验证活动密码
 * @param {number} activityId 活动ID
 * @param {string} password 密码
 */
function verifyPassword(activityId, password) {
  return cloudContainer.post('/api/activity/verify-password', {
    activityId,
    password
  });
}

/**
 * 获取活动可用房间
 * @param {number} activityId 活动ID
 */
function getAvailableRooms(activityId) {
  return cloudContainer.get(`/api/activity/${activityId}/rooms`);
}

/**
 * 抢购房间
 * @param {number} activityId 活动ID
 * @param {number} roomId 房间ID
 * @param {string} phoneNumber 手机号
 */
function grabRoom(activityId, roomId, phoneNumber) {
  return cloudContainer.post('/api/activity/grab-room', {
    activityId,
    roomId,
    phoneNumber
  });
}

/**
 * 创建活动
 * @param {Object} activityData 活动数据
 */
function createActivity(activityData) {
  return cloudContainer.post('/api/activity/create', activityData);
}

module.exports = {
  getActivities,
  getActivityById,
  verifyPassword,
  getAvailableRooms,
  grabRoom,
  createActivity
};
