/**
 * 微信小程序云托管调用工具
 * 基于wx.cloud.callContainer实现，提供更高效的云托管服务调用
 * 
 * 优势:
 * 1. 不耗费公网流量，前后端通信走内网
 * 2. 天然免疫DDoS攻击，仅授权小程序可访问
 * 3. 通过微信就近接入节点加速，无视后端服务地域影响
 * 4. 无需在小程序后台配置「服务器域名」
 * 5. 后端可直接获取用户信息，无需调接口获取openid
 * 
 * 限制:
 * 1. 请求超时时间不得超过15秒
 * 2. 请求大小限制100K，不建议包含图片等大文件
 */

const env = require('../env');
const log = require('./log');

// 云托管限制常量
const CLOUD_CONTAINER_LIMITS = {
  // 最大请求超时时间（微信限制为15秒）
  MAX_TIMEOUT: 15000,
  // 最大请求大小（微信限制为100KB）
  MAX_REQUEST_SIZE: 100 * 1024,
  // 默认超时时间（设置为10秒，留有余量）
  DEFAULT_TIMEOUT: 10000
};

/**
 * 计算对象大小（字节）
 * @param {Object} obj - 要计算大小的对象
 * @return {Number} 对象大小（字节）
 */
function getObjectSize(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  } catch (e) {
    log.warn('计算对象大小失败', e);
    return 0; // 无法计算时返回0
  }
}

/**
 * 调用云托管服务
 * @param {Object} options - 调用选项
 * @param {String} options.path - API路径
 * @param {String} options.method - HTTP方法
 * @param {Object} options.data - 请求数据
 * @param {Number} options.timeout - 超时时间（毫秒）
 * @param {Boolean} options.useInternal - 是否使用内网地址（默认为true）
 * @return {Promise} 返回Promise对象
 */
function callContainer(options = {}) {
  // 默认参数
  const {
    path = '/',
    method = 'GET',
    data = {},
    timeout = CLOUD_CONTAINER_LIMITS.DEFAULT_TIMEOUT,
    useInternal = true // 默认使用内网地址
  } = options;

  // 确保超时时间不超过微信限制
  const safeTimeout = Math.min(timeout, CLOUD_CONTAINER_LIMITS.MAX_TIMEOUT);
  
  // 检查请求大小
  const requestSize = getObjectSize(data);
  if (requestSize > CLOUD_CONTAINER_LIMITS.MAX_REQUEST_SIZE) {
    const errorMsg = `请求数据过大(${Math.round(requestSize/1024)}KB)，超过微信云托管限制(100KB)`;
    log.error(errorMsg, { path, method, dataSize: requestSize });
    return Promise.reject(new Error(errorMsg));
  }

  // 记录调用信息
  log.info('调用云托管', { 
    path, 
    method, 
    dataSize: `${Math.round(requestSize/1024)}KB`, 
    timeout: `${safeTimeout}ms`,
    useInternal
  });

  // 使用云调用方式
  if (env.useCloudContainer) {
    return new Promise((resolve, reject) => {
      wx.cloud.callContainer({
        config: {
          env: env.cloudEnv
        },
        path,
        method,
        data,
        dataType: 'json',
        header: {
          'X-WX-SERVICE': env.serviceName,
          'content-type': 'application/json'
        },
        timeout: safeTimeout,
        success: function(res) {
          log.info('云托管调用成功', { path, statusCode: res.statusCode });
          resolve(res);
        },
        fail: function(err) {
          // 处理错误
          let errorMessage = err.errMsg || '未知错误';
          
          // 超时错误处理
          if (errorMessage.includes('timeout')) {
            errorMessage = `云托管请求超时(${safeTimeout}ms)，微信限制最大15秒。请检查服务是否启动或操作是否耗时过长。`;
          } 
          // 服务不存在错误
          else if (errorMessage.includes('INVALID_SERVICE')) {
            errorMessage = `云托管服务"${env.serviceName}"不存在或未正确配置。请检查服务名称和环境ID。`;
          }
          // 主机错误
          else if (errorMessage.includes('INVALID_HOST')) {
            errorMessage = `云托管环境配置错误。请确保云环境ID"${env.cloudEnv}"正确且已开通云托管。`;
          }
          
          log.error('云托管调用失败', { 
            path, 
            error: errorMessage,
            originalError: err.errMsg
          });
          
          reject(new Error(errorMessage));
        }
      });
    });
  } 
  // 使用内网HTTP请求方式（仅在云托管环境内使用）
  else if (useInternal && env.internalApiBaseUrl) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${env.internalApiBaseUrl}${path}`,
        method,
        data,
        timeout: safeTimeout,
        success: function(res) {
          log.info('内网API调用成功', { path, statusCode: res.statusCode });
          resolve(res);
        },
        fail: function(err) {
          let errorMessage = err.errMsg || '未知错误';
          
          // 超时错误处理
          if (errorMessage.includes('timeout')) {
            errorMessage = `内网API请求超时(${safeTimeout}ms)，请检查服务是否启动。`;
          }
          
          log.error('内网API调用失败', { 
            path, 
            url: `${env.internalApiBaseUrl}${path}`,
            error: errorMessage
          });
          
          reject(new Error(errorMessage));
        }
      });
    });
  }
  // 本地开发环境
  else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${env.apiBaseUrl}${path}`,
        method,
        data,
        timeout: safeTimeout,
        success: function(res) {
          log.info('本地API调用成功', { path, statusCode: res.statusCode });
          resolve(res);
        },
        fail: function(err) {
          log.error('本地API调用失败', { 
            path, 
            url: `${env.apiBaseUrl}${path}`,
            error: err.errMsg || '未知错误'
          });
          reject(err);
        }
      });
    });
  }
}

module.exports = {
  callContainer,
  CLOUD_CONTAINER_LIMITS
};
