/**
* +----------------------------------------------------------------------
* | 房产小程序 - 微信云托管版
* +----------------------------------------------------------------------
*/
const app = getApp()
const config = require('../config')
const cloudContainer = require('./cloud-container');

// 使用API基础URL
const apiBaseUrl = config.apiBaseUrl;
// 备用测试域名（仅在测试环境使用）
const testApiBaseUrl = config.testApiBaseUrl;

// 调试日志函数
const debugLog = (message, data) => {
    if (config.enableDebugLog) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
};

// 输出API基础地址，便于调试
debugLog('API基础URL:', apiBaseUrl);
debugLog('备用测试域名:', testApiBaseUrl || '未配置');
debugLog('云环境配置:', {
    env: config.cloudEnv,
    service: config.serviceName
});

const throttle = require('./throttle');

// 使用云托管容器调用方法
const callContainer = (path, method = 'GET', data = {}) => {
    // 确保path以/开头
    if (path.indexOf('/') !== 0) {
        path = '/' + path;
    }

    debugLog(`调用云托管容器: ${method} ${path}`, data);
    
    // 确保云环境已初始化
    if (!wx.cloud) {
        wx.showToast({
            title: '当前微信版本过低，无法使用云能力',
            icon: 'none'
        });
        return Promise.reject({
            code: 'CLOUD_NOT_AVAILABLE',
            message: '当前微信版本过低，无法使用云能力'
        });
    }

    // 确保云环境ID存在
    if (!config.cloudEnv) {
        return Promise.reject({
            code: 'CLOUD_ENV_MISSING',
            message: '云环境ID未配置'
        });
    }

    // 特殊处理/api/count接口
    if (path === '/api/count' && method === 'POST') {
        // 确保data包含action字段
        if (!data.action) {
            data.action = 'inc'; // 默认为增加计数
        }
    }

    return new Promise((resolve, reject) => {
        // 对于GET请求，确保data是对象类型
        const requestData = method === 'GET' ? (typeof data === 'object' ? data : {}) : data;

        // 尝试初始化云环境（如果尚未初始化）
        try {
            wx.cloud.init({
                env: config.cloudEnv,
                traceUser: true
            });
        } catch (err) {
            debugLog('云环境初始化失败', err);
            // 初始化失败不阻止后续调用
        }

        // 打印完整的调用参数，便于调试
        debugLog('云托管调用参数', {
            env: config.cloudEnv,
            path: path,
            method: method,
            service: config.serviceName,
            data: requestData
        });

        wx.cloud.callContainer({
            config: {
                env: config.cloudEnv
            },
            path,
            method,
            data: requestData,
            header: {
                'X-WX-SERVICE': config.serviceName,
                'content-type': 'application/json',
                'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token'
            },
            success: function (res) {
                debugLog(`云托管调用成功: ${path}`, res);

                // 处理后端返回的Result对象
                if (res.statusCode === 200) {
                    const result = res.data;
                    if (result && (result.code === 200 || result.code === 0)) {
                        // 业务成功
                        resolve(result);
                    } else {
                        // 业务错误
                        reject(result || {
                            code: res.statusCode,
                            message: '请求失败'
                        });
                    }
                } else {
                    // HTTP错误
                    reject({
                        code: res.statusCode,
                        message: res.errMsg || '请求失败'
                    });
                }
            },
            fail: function (err) {
                debugLog(`云托管调用失败: ${path}`, err);
                
                // 特殊处理云托管错误
                if (err.errCode === -501000) {
                    console.error('云托管连接错误 (INVALID_HOST):', err);
                    console.error('请检查云环境ID是否正确:', config.cloudEnv);
                    wx.showToast({
                        title: '云服务连接失败，请检查配置',
                        icon: 'none',
                        duration: 3000
                    });
                } else if (err.errCode === -502000) {
                    console.error('云托管服务错误 (INVALID_SERVICE):', err);
                    console.error('请检查服务名称是否正确:', config.serviceName);
                    wx.showToast({
                        title: '云服务名称错误，请检查配置',
                        icon: 'none',
                        duration: 3000
                    });
                }
                
                reject(err);
            },
            complete: function () {
                // 完成请求
            }
        });
    });
};

// 直接HTTP请求方法 - 改为使用云托管调用
const request = (url, method = 'GET', data = {}, headers = {}) => {
    // 确保url以/开头
    const path = url.startsWith('/') ? url : '/' + url;
    
    debugLog(`请求转换为云托管调用: ${method} ${path}`, data);

    // 使用cloudContainer模块调用
    return cloudContainer.callContainer({
        path,
        method,
        data,
        headers: {
            ...headers
        }
    });
};

// 检查是否在云托管环境中运行
const isRunningInCloudEnv = () => {
    // 检查是否在云托管环境中
    return typeof process !== 'undefined' && process.env && process.env.TENCENTCLOUD_RUNENV === 'WX_CLOUD_RUN';
};

// 发送http请求
const http = ({
    url = '',
    data = {},
    method = 'GET',
    ...other
} = {}) => {
    // 使用云托管调用替代HTTP请求
    return cloudContainer.callContainer({
        path: url.startsWith('/') ? url : '/' + url,
        method,
        data,
        ...other
    });
};

// 判断是否需要拼接请求头
const getUrl = (url) => {
    if (url.indexOf('http') !== -1) {
        return url
    }
    return apiBaseUrl + url
};

// 云函数调用
const callCloudFunction = (name, data = {}) => {
    return new Promise((resolve, reject) => {
        if (!wx.cloud) {
            reject(new Error('当前微信版本过低，无法使用云能力'));
            return;
        }
        
        wx.cloud.callFunction({
            name,
            data,
            success: res => {
                resolve(res.result);
            },
            fail: err => {
                reject(err);
            }
        });
    });
};

// get请求
const get = (url, data = {}) => {
    return cloudContainer.get(url, data);
};

// post请求
const post = (url, data = {}) => {
    return cloudContainer.post(url, data);
};

// put请求
const put = (url, data = {}) => {
    return cloudContainer.put(url, data);
};

// delete请求
const destroy = (url, data = {}) => {
    return cloudContainer.del(url, data);
};

module.exports = {
    get,
    post,
    put,
    destroy,
    request,
    http,
    callContainer,
    callCloudFunction,
    getUrl
};
