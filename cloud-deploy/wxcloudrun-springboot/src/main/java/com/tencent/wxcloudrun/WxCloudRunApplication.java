package com.tencent.wxcloudrun;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.context.ConfigurableApplicationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@MapperScan(basePackages = {"com.tencent.wxcloudrun.dao"})
public class WxCloudRunApplication {  
  private static final Logger logger = LoggerFactory.getLogger(WxCloudRunApplication.class);

  public static void main(String[] args) {
    ConfigurableApplicationContext context = SpringApplication.run(WxCloudRunApplication.class, args);
    
    // 获取环境变量和配置信息
    Environment env = context.getEnvironment();
    String port = env.getProperty("server.port");
    String contextPath = env.getProperty("server.servlet.context-path", "");
    
    // 打印应用启动信息
    logger.info("应用启动成功!");
    logger.info("服务地址: http://localhost:{}{}", port, contextPath);
    logger.info("环境变量PORT: {}", System.getenv("PORT"));
    logger.info("配置的端口: {}", port);
  }
}
