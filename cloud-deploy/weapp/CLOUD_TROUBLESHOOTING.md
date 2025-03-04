# 微信云托管问题排查指南

本文档提供了在使用微信云托管服务时常见问题的排查方法和解决方案。

## 常见错误及解决方案

### 1. 调用 CloudBase 容器 API 失败 (cloud.callContainer:fail Error: errCode: -501000 | errMsg: Invalid request)

#### 问题描述
调用 `cloud.callContainer` 时，报错提示 `errCode: -501000 | errMsg: Invalid request`。

#### 可能原因
1. 请求路径或请求方法错误：容器内并不存在对应的 API 路径，或方法（GET/POST）与后端定义不符。
2. 容器未正常启动或处于错误状态：导致无法正常响应请求。
3. 请求参数或头信息不符合要求：后端进行参数校验时认为请求无效。
4. 云环境ID或服务名称配置错误：在 `env.js` 中的 `cloudEnv` 或 `serviceName` 配置不正确。

#### 解决方案
1. 检查 `env.js` 中的 `cloudEnv` 和 `serviceName` 配置是否正确：
   ```javascript
   // 正确的配置示例
   production: {
     apiBaseUrl: 'https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com',
     cloudEnv: 'prod-0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z', // 确保这是正确的云环境ID
     serviceName: 'springboot', // 确保这是正确的服务名称
     minLibVersion: '2.23.0',
     enableDebugLog: false,
     useCloudContainer: true
   }
   ```

2. 确保请求头中包含正确的 `X-WX-SERVICE` 和 `content-type`：
   ```javascript
   wx.cloud.callContainer({
     config: {
       env: config.cloudEnv
     },
     path: '/api/activity/list',
     method: 'GET',
     header: {
       'X-WX-SERVICE': config.serviceName,
       'content-type': 'application/json'
     },
     success: (res) => {
       // 处理成功响应
     },
     fail: (err) => {
       // 处理错误
     }
   });
   ```

3. 使用测试页面 (`pages/test/cloud-test`) 检查云环境连接状态和配置。

4. 在微信云开发控制台检查容器状态和日志，确认服务是否正常运行。

### 2. 请求返回 503 (Service Unavailable) / 504 (Gateway Timeout)

#### 问题描述
访问云托管服务时返回 503 Service Unavailable 或 504 Gateway Timeout 错误。

#### 可能原因
1. 容器进程未启动或启动后崩溃。
2. 后端处理耗时过长，请求超时。
3. 负载均衡/网络配置异常。
4. 路径不正确。

#### 解决方案
1. 在云托管控制台检查容器实例状态和日志。
2. 确认 Dockerfile 和代码中正确监听了相同端口，并且在云托管的「服务端口」配置与实际端口匹配。
3. 检查后端代码中是否存在长耗时操作或死循环。
4. 使用云托管提供的「实时日志」或「监控」功能查看请求处理情况。

### 3. "域名不在合法列表"或"request:fail url not in domain list"

#### 问题描述
日志提示 request 合法域名校验出错 或 ... not in domain list，导致请求失败。

#### 可能原因
1. 请求的域名未添加到小程序「request 合法域名」中。
2. 已添加域名，但本地开发者工具未刷新域名配置。

#### 解决方案
1. 在微信公众平台的「开发管理 - 开发设置 - 服务器域名」中，添加云托管域名到「request 合法域名」列表。
2. 在本地开发者工具中，点击「详情 - 域名信息 - 刷新」，重新编译。
3. 如果在开发环境中，可以在开发者工具中勾选「不校验合法域名」选项（仅用于开发调试）。
4. 使用云托管容器调用方式（`cloud.callContainer`）可以绕过域名限制。

### 4. activityService.verifyActivityCode is not a function / 函数不存在

#### 问题描述
日志出现 TypeError: activityService.verifyActivityCode is not a function 等类似提示。

#### 可能原因
1. 方法名拼写错误或未定义。
2. 导出写法不对。
3. import/require 路径错误。

#### 解决方案
1. 检查 `services/activity-service.js` 文件中是否正确定义了 `verifyActivityCode` 方法：
   ```javascript
   verifyActivityCode: function (activityCode) {
     return request({
       url: '/api/activity/verify-code',
       method: 'POST',
       data: { activityCode }
     });
   }
   ```

2. 确认导出和导入方式匹配：
   ```javascript
   // 导出
   module.exports = activityService;
   
   // 导入
   const activityService = require('../../../services/activity-service');
   ```

3. 使用控制台打印 `activityService` 对象，检查实际包含的方法。

### 5. 无法加载本地图片

#### 问题描述
日志提示 Failed to load local image resource /assets/images/scan-icon.png。

#### 可能原因
1. 图片路径不正确或文件不存在。
2. 云端资源配置问题。

#### 解决方案
1. 确认项目结构中图片文件的正确路径，例如 `/assets/images/scan/icon.png`。
2. 在 WXML 中使用正确的路径：
   ```html
   <image class="scan-icon" src="/assets/images/scan/icon.png" mode="aspectFit"></image>
   ```

## 调试工具

### 云托管连接测试页面

我们提供了一个测试页面 (`pages/test/cloud-test`)，用于检查云环境连接状态和配置。通过此页面，您可以：

1. 查看当前环境配置信息
2. 测试云环境初始化
3. 测试云托管容器调用
4. 查看详细的错误信息

### 开启调试日志

在 `env.js` 中设置 `enableDebugLog: true` 可以开启详细的调试日志，帮助排查问题：

```javascript
development: {
  // ...其他配置
  enableDebugLog: true,
}
```

## 联系支持

如果您在排查问题后仍然无法解决，请联系微信云开发支持团队或参考以下资源：

- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [微信云托管文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/guidance.html)
- [错误码参考](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference/errcode.html)

## 云托管配置信息

### 访问地址
- **公网访问**: `https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com`
- **内网访问**: `cdmoyuli.springboot-uc65.jpz1lqiu.l9g8gc3b.com`

### 云环境信息
- **云环境ID**: `0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z`
- **服务名称**: `springboot`

### 容器规格
- **CPU**: 1核
- **内存**: 2G
- **实例副本数**: 最小0，最大5
- **扩缩容条件**: CPU使用率≥50%，内存使用率≥50%

### 环境变量
```json
{
  "COS_BUCKET": "7072-prod-4gqa4n181c615ff2-1322503328",
  "COS_REGION": "ap-shanghai",
  "MYSQL_ADDRESS": "10.48.100.162:3306",
  "MYSQL_PASSWORD": "uNvv89FG",
  "MYSQL_USERNAME": "root"
}
```

## 后端API说明

后端提供了以下API：

- **GET /api/count**: 获取当前计数值
- **POST /api/count**: 更新计数值，需要 `{ action: 'inc' }` 参数
- **GET /api/activity/list**: 获取活动列表
- **POST /api/activity/verify-code**: 验证活动码

## 其他注意事项

1. **公网域名限制**: 公网域名仅能支持测试使用，请勿用于线上生产，且公网域名没有防刷防DDoS能力。

2. **环境变量**: 确保后端服务正确配置了环境变量，特别是数据库连接信息。

3. **微信开发者工具**: 使用最新版本的微信开发者工具，确保基础库版本满足要求（最低版本：2.23.0）。

4. **网络环境**: 确保开发环境网络稳定，可以访问微信云托管服务。

## 504 Gateway Timeout 错误排查指南

### 问题描述

504 Gateway Timeout 表示请求到达网关但后端容器没有及时响应。这是微信云托管环境中最常见的错误之一，通常表明后端服务未能在预期时间内响应请求。

### 常见原因及解决方案

#### 1. 容器未正常启动或正在冷启动中

**症状**：
- 首次访问时出现504错误
- 一段时间不访问后再次访问出现504错误

**原因**：
- 最小副本数设置为0，请求到来时需要启动容器
- 容器启动时间较长，超过了网关的等待时间
- 容器启动失败或崩溃

**解决方案**：
- 在云托管控制台将最小副本数从0调整为1，避免冷启动
- 使用测试页面的"启动服务"按钮预热容器
- 等待1-2分钟后重试，容器启动需要时间
- 查看容器日志确认是否有启动错误

```javascript
// 使用cloud-test页面的启动服务功能
wx.navigateTo({
  url: '/pages/test/cloud-test'
});
```

#### 2. 端口配置不匹配

**症状**：
- 容器日志显示应用已启动，但请求仍然超时
- 无法连接到应用服务

**原因**：
- 应用监听的端口与云托管配置不一致
- Dockerfile中EXPOSE的端口与应用监听端口不匹配
- 环境变量中指定的端口与应用配置不一致

**解决方案**：
- 确认SpringBoot应用的`server.port`配置（默认8080）
- 检查Dockerfile中的EXPOSE指令是否与应用端口一致
- 检查云托管环境变量中的PORT或TENCENTCLOUD_RUN_PORT设置
- 修改应用配置以匹配云托管期望的端口

```java
// SpringBoot应用端口配置示例
server.port=8080
```

#### 3. 网络/域名配置不正确

**症状**：
- 出现INVALID_HOST错误后紧接着504错误
- 请求无法正确路由到应用容器

**原因**：
- 域名指向了错误的环境或服务
- 小程序端使用的域名与云托管控制台配置不一致
- 域名未添加到合法域名列表

**解决方案**：
- 确保env.js中的cloudEnv值不包含prod-前缀：`0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z`
- 使用云托管控制台提供的正确域名：`https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com`
- 在微信公众平台添加域名到合法域名列表
- 在开发环境可临时在微信开发者工具中设置"不校验合法域名"

#### 4. 应用逻辑处理时间过长

**症状**：
- 简单请求正常，复杂请求超时
- 负载增加时出现超时

**原因**：
- 后端有大计算量操作
- 数据库查询耗时过长
- 循环或递归处理大量数据

**解决方案**：
- 优化数据库查询，添加适当的索引
- 将耗时操作异步化处理
- 分批处理大量数据
- 增加超时设置，允许更长的处理时间

### 排查步骤

1. **查看容器启动日志**
   - 在微信云托管控制台查看服务日志
   - 确认SpringBoot应用是否成功启动
   - 检查是否有异常信息

2. **检查端口配置**
   - 确认Dockerfile中的EXPOSE指令（应为8080）
   - 确认SpringBoot的server.port配置
   - 确认云托管环境变量中的端口设置

3. **检查副本数与启动耗时**
   - 查看最小副本数设置，建议设为1避免冷启动
   - 如果设为0，首次请求需要等待容器启动
   - 使用测试页面的"启动服务"按钮预热容器

4. **检查域名与访问路径**
   - 确保使用正确的域名格式
   - 检查域名是否已添加到合法域名列表
   - 验证云环境ID格式是否正确（不含prod-前缀）

5. **排除应用逻辑问题**
   - 检查是否有耗时操作
   - 在本地环境测试相同逻辑
   - 添加日志记录执行时间

### 使用云托管测试页面

我们提供了专门的测试页面用于诊断云托管问题：

```javascript
// 打开云托管测试页面
wx.navigateTo({
  url: '/pages/test/cloud-test'
});
```

测试页面提供以下功能：
- 云环境初始化测试
- 云托管GET/POST请求测试
- 标准HTTP请求测试
- 启动服务功能
- 配置信息显示
- 详细错误分析

### 配置参考

**正确的云托管配置**：
- 云环境ID: `0d1hHa0w390gu43Oq0w3A1CXs1hHa0Z`（不含prod-前缀）
- 服务名称: `springboot`（生产环境）/ `wxcloudrun-springboot`（开发环境）
- API基础URL: `https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com`
- 内网访问地址: `cdmoyuli.springboot-uc65.jpz1lqiu.l9g8gc3b.com`
- 容器规格: 1核2G，最小0实例，最大5实例

### 常见错误码

- **-501000**: INVALID_HOST - 无效的主机配置
- **-502000**: INVALID_SERVICE - 无效的服务配置
- **504**: Gateway Timeout - 网关超时

如有其他问题，请联系技术支持或参考[微信云托管官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/guidance.html)。

## 云托管自定义域名配置指南

### 为什么需要自定义域名

微信云托管默认提供的域名（如`https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com`）**仅用于测试**，存在以下限制：

1. 不稳定性：默认域名可能会随着服务更新而变化
2. 安全限制：默认域名在正式环境中可能被限制访问
3. 品牌形象：默认域名不利于品牌展示和用户体验
4. 合规要求：正式上线的小程序应使用备案过的自定义域名

### 自定义域名配置步骤

#### 1. 域名准备

- 准备一个已完成ICP备案的域名（如：api.yourdomain.com）
- 确保域名可以正常解析

#### 2. 云托管控制台配置

1. 登录微信云托管控制台
2. 进入"环境 -> 服务"页面
3. 选择需要绑定自定义域名的服务
4. 点击"自定义域名"标签
5. 点击"添加域名"
6. 填写已备案的域名（如：api.yourdomain.com）
7. 根据提示配置DNS解析（通常是CNAME记录）
8. 等待域名验证和SSL证书配置完成

#### 3. 小程序配置

1. 修改`env.js`文件中的`apiBaseUrl`为自定义域名：

```javascript
production: {
  // ...其他配置
  apiBaseUrl: 'https://api.yourdomain.com',  // 替换为您已备案的自定义域名
  testApiBaseUrl: 'https://springboot-uc65-143257-4-1322503328.sh.run.tcloudbase.com', // 仅用于测试
  // ...其他配置
}
```

2. 在微信公众平台添加自定义域名到request合法域名列表：
   - 登录微信公众平台
   - 进入"开发 -> 开发设置 -> 服务器域名"
   - 在"request合法域名"中添加自定义域名（如：https://api.yourdomain.com）

### 开发环境与生产环境的域名切换

我们已经在`request.js`中实现了自动切换逻辑：

- 开发环境（development）或调试模式（debug=true）：优先使用`testApiBaseUrl`（默认云托管域名）
- 生产环境：使用`apiBaseUrl`（自定义域名）

这样可以在开发测试时使用默认域名，而在正式环境中自动切换到自定义域名。

### 自定义域名的优势

1. **稳定性**：自定义域名不会随服务更新而变化
2. **安全性**：可以配置更严格的安全策略
3. **品牌一致性**：与您的品牌形象保持一致
4. **合规性**：符合小程序上线的合规要求
5. **灵活性**：可以更灵活地进行DNS管理和流量控制

### 注意事项

1. 自定义域名必须完成ICP备案
2. 配置HTTPS证书确保安全通信
3. 确保在微信公众平台添加到合法域名列表
4. 测试环境和生产环境的切换逻辑正确
5. 定期检查证书有效期，避免过期

如有其他问题，请参考[微信云托管官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/custom-domain.html)。
