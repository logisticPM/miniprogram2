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
 */

const config = require('../config');
const env = require('../env');

// 调试日志函数
const debugLog = (message, data) => {
  if (config.enableDebugLog) {
    console.log(`[CLOUD] ${message}`, data || '');
  }
};

// 云实例
let cloudInstance = null;

/**
 * 初始化云环境
 * @returns {Promise} 初始化结果
 */
const initCloud = async () => {
  if (!wx.cloud) {
    throw new Error('当前微信版本过低，无法使用云能力，请升级微信版本');
  }

  try {
    // 如果已经初始化过，直接返回
    if (cloudInstance) {
      return cloudInstance;
    }

    // 创建云实例
    cloudInstance = new wx.cloud.Cloud({
      resourceAppid: 'wxede451d72eb0429a', // 添加小程序AppID
      resourceEnv: env.cloudEnv, // 微信云托管的环境ID
    });

    // 初始化云环境
    await cloudInstance.init();
    debugLog('云环境初始化成功', env.cloudEnv);
    
    return cloudInstance;
  } catch (error) {
    debugLog('云环境初始化失败', error);
    throw error;
  }
};

/**
 * 调用云托管服务
 * @param {Object} options 调用参数
 * @param {string} options.path 请求路径，例如 '/api/count'
 * @param {string} options.method 请求方法，例如 'GET', 'POST'
 * @param {Object} options.data 请求数据
 * @param {Object} options.headers 额外的请求头
 * @param {string} options.dataType 返回数据类型，默认为json
 * @param {number} options.timeout 超时时间，单位毫秒
 * @returns {Promise} 调用结果
 */
const callContainer = async (options) => {
  const { 
    path, 
    method = 'GET', 
    data = {}, 
    headers = {}, 
    dataType,
    timeout
  } = options;

  // 确保path以/开头
  const requestPath = path.startsWith('/') ? path : `/${path}`;
  
  try {
    // 确保云环境已初始化
    await initCloud();

    // 构建请求参数
    const requestOptions = {
      config: {
        env: env.cloudEnv, // 微信云托管的环境ID
      },
      path: requestPath, // 请求路径
      method: method, // 请求方法
      data: data, // 请求数据
      header: {
        'X-WX-SERVICE': env.serviceName, // 服务名称
        'content-type': 'application/json',
        // 排除不需要的用户凭证信息，提高性能
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token',
        ...headers // 合并自定义请求头
      }
    };

    // 可选参数
    if (dataType) requestOptions.dataType = dataType;
    if (timeout) requestOptions.timeout = timeout;

    debugLog(`调用云托管服务: ${method} ${requestPath}`, {
      env: env.cloudEnv,
      service: env.serviceName,
      data
    });

    // 使用 Promise 包装调用，以便更好地处理错误
    return new Promise((resolve, reject) => {
      cloudInstance.callContainer({
        ...requestOptions,
        success: (result) => {
          debugLog(`云托管调用成功: ${method} ${requestPath}`, {
            status: result.statusCode,
            callId: result.callID || 'unknown'
          });
          
          // 返回业务数据
          resolve(result.data);
        },
        fail: (error) => {
          debugLog(`云托管调用失败: ${method} ${requestPath}`, error);
          
          // 检查是否是 Invalid host 相关错误
          if (error && error.errMsg && (error.errMsg.includes('invalid host') || error.errMsg.includes('Invalid host'))) {
            debugLog('检测到 Invalid host 错误，可能是云环境ID格式问题');
            
            // 尝试修复环境ID格式问题
            let fixedEnv = env.cloudEnv;
            // 如果环境ID不包含prod-前缀，尝试添加
            if (!fixedEnv.startsWith('prod-')) {
              fixedEnv = `prod-${fixedEnv}`;
              debugLog('尝试使用修正后的环境ID', fixedEnv);
              
              // 使用修正后的环境ID重试
              cloudInstance.callContainer({
                ...requestOptions,
                config: {
                  env: fixedEnv,
                },
                success: (result) => {
                  debugLog(`使用修正环境ID调用成功: ${method} ${requestPath}`, {
                    status: result.statusCode,
                    callId: result.callID || 'unknown'
                  });
                  resolve(result.data);
                },
                fail: (retryError) => {
                  debugLog('使用修正环境ID仍然失败', retryError);
                  
                  // 不再回退到HTTP请求，直接返回错误
                  wx.showToast({
                    title: '云托管连接失败',
                    icon: 'none',
                    duration: 2000
                  });
                  reject({
                    code: 'CLOUD_CONTAINER_ERROR',
                    message: '云托管连接失败，请检查网络和配置',
                    originalError: retryError
                  });
                }
              });
            } else {
              // 如果包含prod-前缀但仍然失败，直接返回错误
              wx.showToast({
                title: '云托管连接失败',
                icon: 'none',
                duration: 2000
              });
              reject({
                code: 'CLOUD_CONTAINER_ERROR',
                message: '云托管连接失败，请检查网络和配置',
                originalError: error
              });
            }
          } else if (error && error.errMsg && error.errMsg.includes('PathSet')) {
            debugLog('检测到 PathSet 错误');
            
            // 不再回退到HTTP请求，直接返回错误
            wx.showToast({
              title: '云托管路径错误',
              icon: 'none',
              duration: 2000
            });
            reject({
              code: 'CLOUD_PATH_ERROR',
              message: '云托管路径错误，请检查API路径配置',
              originalError: error
            });
          } else {
            // 其他错误直接返回
            wx.showToast({
              title: '云托管调用失败',
              icon: 'none',
              duration: 2000
            });
            reject({
              code: 'CLOUD_CONTAINER_ERROR',
              message: '云托管调用失败，请检查网络和配置',
              originalError: error
            });
          }
        }
      });
    });
  } catch (error) {
    // 处理初始化错误
    if (error.toString().indexOf("Cloud API isn't enabled") !== -1) {
      debugLog('云API未启用，尝试重新初始化', error);
      cloudInstance = null; // 重置云实例
      
      // 延迟300ms后重试一次
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const retryResult = await callContainer(options);
            resolve(retryResult);
          } catch (retryError) {
            reject(retryError);
          }
        }, 300);
      });
    }

    // 其他错误
    debugLog(`云托管调用失败: ${method} ${requestPath}`, error);
    throw error;
  }
};

/**
 * GET请求
 * @param {string} path 请求路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果
 */
const get = (path, data = {}, options = {}) => {
  return callContainer({
    path,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * POST请求
 * @param {string} path 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果
 */
const post = (path, data = {}, options = {}) => {
  return callContainer({
    path,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {string} path 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果
 */
const put = (path, data = {}, options = {}) => {
  return callContainer({
    path,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {string} path 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果
 */
const del = (path, data = {}, options = {}) => {
  return callContainer({
    path,
    method: 'DELETE',
    data,
    ...options
  });
};

module.exports = {
  initCloud,
  callContainer,
  get,
  post,
  put,
  delete: del
};
