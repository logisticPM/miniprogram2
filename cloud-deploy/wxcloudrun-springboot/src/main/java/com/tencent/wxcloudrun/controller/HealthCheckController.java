package com.tencent.wxcloudrun.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供健康检查端点，用于云托管服务监控应用状态
 */
@RestController
public class HealthCheckController {

    private final Logger logger = LoggerFactory.getLogger(HealthCheckController.class);
    
    @Value("${server.port:80}")
    private String serverPort;
    
    @Value("${spring.application.name:wxcloudrun-springboot}")
    private String applicationName;

    /**
     * 健康检查端点
     * @return 应用状态信息
     */
    @GetMapping("/api/health")
    public Map<String, Object> healthCheck() {
        logger.info("健康检查请求");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", applicationName);
        response.put("port", serverPort);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
    
    /**
     * 简单的ping测试端点
     * @return 简单的响应文本
     */
    @GetMapping("/api/ping")
    public String ping() {
        logger.info("Ping请求");
        return "pong";
    }
    
    /**
     * 环境信息端点
     * @return 环境变量和系统信息
     */
    @GetMapping("/api/environment")
    public Map<String, Object> environment() {
        logger.info("环境信息请求");
        
        Map<String, Object> env = new HashMap<>();
        env.put("port", serverPort);
        env.put("PORT环境变量", System.getenv("PORT"));
        env.put("java.version", System.getProperty("java.version"));
        env.put("os.name", System.getProperty("os.name"));
        env.put("user.timezone", System.getProperty("user.timezone"));
        
        return env;
    }
}
