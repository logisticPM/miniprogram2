package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.dto.UserLoginRequest;
import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    final UserService userService;
    final Logger logger;

    public UserController(@Autowired UserService userService) {
        this.userService = userService;
        this.logger = LoggerFactory.getLogger(UserController.class);
    }

    /**
     * 用户登录
     * @param request 登录请求
     * @return API响应
     */
    @PostMapping("/login")
    public ApiResponse login(@RequestBody UserLoginRequest request) {
        logger.info("/api/user/login POST请求，手机号: {}", request.getPhoneNumber());
        
        try {
            // 根据手机号查找或创建用户
            User user = userService.loginByPhoneNumber(request.getPhoneNumber());
            return ApiResponse.ok(user);
        } catch (Exception e) {
            logger.error("用户登录失败", e);
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     * @param id 用户ID
     * @return API响应
     */
    @GetMapping("/{id}")
    public ApiResponse getUserInfo(@PathVariable Integer id) {
        logger.info("/api/user/{} GET请求", id);
        
        try {
            User user = userService.getById(id);
            if (user != null) {
                return ApiResponse.ok(user);
            } else {
                return ApiResponse.error("用户不存在");
            }
        } catch (Exception e) {
            logger.error("获取用户信息失败", e);
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }
}
