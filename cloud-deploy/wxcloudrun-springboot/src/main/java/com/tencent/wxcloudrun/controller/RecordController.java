package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 抢房记录控制器
 */
@RestController
@RequestMapping("/api/record")
public class RecordController {

    @Autowired
    private RoomService roomService;

    /**
     * 获取用户的抢房记录
     */
    @GetMapping("/list")
    public ApiResponse getUserRecords(HttpServletRequest request) {
        // 从请求属性中获取当前登录用户
        User currentUser = (User) request.getAttribute("currentUser");
        
        if (currentUser == null) {
            return ApiResponse.error(401, "请先登录");
        }
        
        try {
            // 获取用户的抢房记录
            List<Map<String, Object>> records = roomService.getUserGrabRecords(currentUser.getPhoneNumber());
            
            Map<String, Object> result = new HashMap<>();
            result.put("records", records);
            result.put("total", records.size());
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            return ApiResponse.error("获取抢房记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据手机号获取用户的抢房记录
     * @param phoneNumber 用户手机号
     * @return API response json
     */
    @GetMapping("/user-records")
    public ApiResponse getUserRecordsByPhone(@RequestParam String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ApiResponse.error("手机号不能为空");
        }
        
        try {
            // 获取用户的抢房记录
            List<Map<String, Object>> records = roomService.getUserGrabRecords(phoneNumber);
            
            Map<String, Object> result = new HashMap<>();
            result.put("records", records);
            result.put("total", records.size());
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            return ApiResponse.error("获取抢房记录失败: " + e.getMessage());
        }
    }
}
