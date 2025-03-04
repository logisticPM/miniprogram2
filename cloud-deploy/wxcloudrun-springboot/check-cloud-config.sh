#!/bin/bash
# 微信云托管配置检查脚本
# 用于诊断和修复常见的配置问题

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== 微信云托管配置检查工具 =====${NC}"
echo "检查日期: $(date)"
echo

# 检查端口配置
echo -e "${BLUE}[1/5] 检查端口配置${NC}"
PORT_ENV=$(printenv PORT)
if [ -z "$PORT_ENV" ]; then
  echo -e "${YELLOW}警告: 未设置PORT环境变量，将使用默认值80${NC}"
  export PORT=80
else
  echo -e "${GREEN}PORT环境变量已设置: $PORT_ENV${NC}"
fi

# 检查应用是否在指定端口监听
echo -e "\n${BLUE}[2/5] 检查应用监听状态${NC}"
if netstat -tulpn 2>/dev/null | grep -q ":$PORT.*LISTEN"; then
  echo -e "${GREEN}应用正在端口 $PORT 上监听${NC}"
else
  echo -e "${RED}错误: 应用未在端口 $PORT 上监听${NC}"
  echo "检查应用日志以了解更多信息"
fi

# 检查健康检查端点
echo -e "\n${BLUE}[3/5] 测试健康检查端点${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$HEALTH_RESPONSE" ]; then
  echo -e "${GREEN}健康检查端点可访问${NC}"
  echo "响应: $HEALTH_RESPONSE"
else
  echo -e "${RED}错误: 无法访问健康检查端点${NC}"
  echo "尝试使用简单的ping端点..."
  
  PING_RESPONSE=$(curl -s http://localhost:$PORT/api/ping 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$PING_RESPONSE" ]; then
    echo -e "${YELLOW}ping端点可访问，但健康检查端点不可用${NC}"
  else
    echo -e "${RED}错误: ping端点也不可访问${NC}"
  fi
fi

# 检查Java进程
echo -e "\n${BLUE}[4/5] 检查Java进程${NC}"
JAVA_PROCESS=$(ps -ef | grep java | grep -v grep)
if [ -n "$JAVA_PROCESS" ]; then
  echo -e "${GREEN}Java进程正在运行${NC}"
  echo "$JAVA_PROCESS" | head -1
  
  # 检查Java进程的端口参数
  if echo "$JAVA_PROCESS" | grep -q "server.port=$PORT"; then
    echo -e "${GREEN}Java进程使用正确的端口参数${NC}"
  else
    echo -e "${RED}警告: Java进程可能使用了不同的端口参数${NC}"
    echo "实际命令行: $(echo "$JAVA_PROCESS" | grep -o 'server\.port=[^ ]*')"
  fi
else
  echo -e "${RED}错误: 未找到Java进程${NC}"
fi

# 检查日志文件
echo -e "\n${BLUE}[5/5] 检查应用日志${NC}"
if [ -f "/app/logs/app.log" ]; then
  echo -e "${GREEN}应用日志文件存在${NC}"
  echo "最近的日志内容:"
  tail -n 10 /app/logs/app.log
else
  echo -e "${YELLOW}警告: 未找到应用日志文件${NC}"
fi

# 总结
echo -e "\n${BLUE}===== 检查完成 =====${NC}"
echo "如果发现问题，请参考 DEPLOYMENT.md 文件获取更多信息"
echo "或访问微信云托管文档: https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/container/service.html"
