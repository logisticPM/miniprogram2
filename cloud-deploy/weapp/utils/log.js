/**
 * 日志工具模块
 * 用于统一管理应用的日志输出
 */

const env = require('../env');

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 999
};

// 当前日志级别
const currentLevel = env.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * 格式化日志信息
 * @param {String} level - 日志级别
 * @param {String} message - 日志消息
 * @param {Object} data - 附加数据
 * @return {String} 格式化后的日志字符串
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}][${level}]`;
  
  if (data) {
    if (typeof data === 'object') {
      try {
        return `${prefix} ${message}: ${JSON.stringify(data)}`;
      } catch (e) {
        return `${prefix} ${message}: [无法序列化的对象]`;
      }
    } else {
      return `${prefix} ${message}: ${data}`;
    }
  }
  
  return `${prefix} ${message}`;
}

/**
 * 输出调试日志
 * @param {String} message - 日志消息
 * @param {Object} data - 附加数据
 */
function debug(message, data) {
  if (currentLevel <= LOG_LEVELS.DEBUG && env.enableDebugLog) {
    console.debug(formatLog('DEBUG', message, data));
  }
}

/**
 * 输出信息日志
 * @param {String} message - 日志消息
 * @param {Object} data - 附加数据
 */
function info(message, data) {
  if (currentLevel <= LOG_LEVELS.INFO && env.enableDebugLog) {
    console.info(formatLog('INFO', message, data));
  }
}

/**
 * 输出警告日志
 * @param {String} message - 日志消息
 * @param {Object} data - 附加数据
 */
function warn(message, data) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(formatLog('WARN', message, data));
  }
}

/**
 * 输出错误日志
 * @param {String} message - 日志消息
 * @param {Object} data - 附加数据
 */
function error(message, data) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(formatLog('ERROR', message, data));
  }
}

module.exports = {
  debug,
  info,
  warn,
  error,
  LOG_LEVELS
};
