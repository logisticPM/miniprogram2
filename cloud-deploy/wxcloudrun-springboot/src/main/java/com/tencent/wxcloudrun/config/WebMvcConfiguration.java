package com.tencent.wxcloudrun.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 */
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

    @Autowired
    private UserLoginInterceptor userLoginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加用户登录拦截器
        registry.addInterceptor(userLoginInterceptor)
                // 需要登录的接口路径
                .addPathPatterns("/api/activity/create")
                .addPathPatterns("/api/activity/join")
                .addPathPatterns("/api/activity/grab")
                .addPathPatterns("/api/user/info")
                .addPathPatterns("/api/record/**")
                // 排除不需要登录的接口路径
                .excludePathPatterns("/api/user/login")
                .excludePathPatterns("/api/activity/list")
                .excludePathPatterns("/api/activity/detail/**");
    }
}
