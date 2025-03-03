package com.tencent.wxcloudrun.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.dto.ActivityRequest;
import com.tencent.wxcloudrun.dto.GrabRequest;
import com.tencent.wxcloudrun.dto.VerifyPasswordRequest;
import com.tencent.wxcloudrun.model.Activity;
import com.tencent.wxcloudrun.model.Room;
import com.tencent.wxcloudrun.service.ActivityService;
import com.tencent.wxcloudrun.service.RoomService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 抢房活动控制器
 */
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityService activityService;
    private final RoomService roomService;
    private final Logger logger;
    
    @Value("${admin.password:9000000}")
    private String adminPassword;

    public ActivityController(@Autowired ActivityService activityService, 
                             @Autowired RoomService roomService) {
        this.activityService = activityService;
        this.roomService = roomService;
        this.logger = LoggerFactory.getLogger(ActivityController.class);
    }

    /**
     * 创建抢房活动
     * @param request {@link ActivityRequest}
     * @return API response json
     */
    @PostMapping("/create")
    public ApiResponse createActivity(@RequestBody ActivityRequest request) {
        logger.info("/api/activity/create post request, title: {}", request.getTitle());
        
        // 验证管理员密码
        if (!adminPassword.equals(request.getAdminPassword())) {
            return ApiResponse.error("管理员密码错误");
        }
        
        try {
            // 创建活动
            Activity activity = new Activity();
            activity.setTitle(request.getTitle());
            activity.setStartTime(LocalDateTime.parse(request.getStartTime()));
            activity.setEndTime(LocalDateTime.parse(request.getEndTime()));
            activity.setPassword(request.getPassword());
            activity.setBuildingNumber(request.getBuildingNumber());
            activity.setUnitCount(request.getUnitCount());
            activity.setFloorCount(request.getFloorCount());
            activity.setStatus("active");
            
            Activity createdActivity = activityService.createActivity(activity);
            
            // 创建房间
            List<Room> rooms = new ArrayList<>();
            for (int unitNum = 1; unitNum <= request.getUnitCount(); unitNum++) {
                for (int floorNum = 1; floorNum <= request.getFloorCount(); floorNum++) {
                    for (String houseType : request.getHouseTypes()) {
                        Room room = new Room();
                        room.setActivityId(createdActivity.getId());
                        room.setBuildingNumber(request.getBuildingNumber());
                        room.setUnitNumber(unitNum);
                        room.setFloorNumber(floorNum);
                        // 房间号格式：楼层号+户型，例如：1A
                        room.setRoomNumber(floorNum + houseType);
                        room.setHouseType(houseType);
                        room.setStatus("available");
                        rooms.add(room);
                    }
                }
            }
            
            roomService.batchCreateRooms(rooms);
            
            Map<String, Object> result = new HashMap<>();
            result.put("activity", createdActivity);
            result.put("roomCount", rooms.size());
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            logger.error("创建抢房活动失败", e);
            return ApiResponse.error("创建抢房活动失败: " + e.getMessage());
        }
    }

    /**
     * 获取活动列表
     * @return API response json
     */
    @GetMapping("/list")
    public ApiResponse getActivities() {
        logger.info("/api/activity/list get request");
        
        try {
            List<Activity> activities = activityService.getActiveActivities();
            return ApiResponse.ok(activities);
        } catch (Exception e) {
            logger.error("获取活动列表失败", e);
            return ApiResponse.error("获取活动列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取活动详情
     * @param id 活动ID
     * @return API response json
     */
    @GetMapping("/{id}")
    public ApiResponse getActivity(@PathVariable Integer id) {
        logger.info("/api/activity/{} get request", id);
        
        try {
            Optional<Activity> activity = activityService.getActivityById(id);
            if (!activity.isPresent()) {
                return ApiResponse.error("活动不存在");
            }
            
            return ApiResponse.ok(activity.get());
        } catch (Exception e) {
            logger.error("获取活动详情失败", e);
            return ApiResponse.error("获取活动详情失败: " + e.getMessage());
        }
    }

    /**
     * 验证活动密码
     * @param request {@link VerifyPasswordRequest}
     * @return API response json
     */
    @PostMapping("/verify")
    public ApiResponse verifyPassword(@RequestBody VerifyPasswordRequest request) {
        logger.info("/api/activity/verify post request, activityId: {}", request.getActivityId());
        
        try {
            Optional<Activity> activity = activityService.getActivityById(request.getActivityId());
            if (!activity.isPresent()) {
                return ApiResponse.error("活动不存在");
            }
            
            // 验证活动状态
            if (!"active".equals(activity.get().getStatus())) {
                return ApiResponse.error("活动已结束");
            }
            
            // 验证活动时间
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(activity.get().getStartTime())) {
                return ApiResponse.error("活动尚未开始");
            }
            if (now.isAfter(activity.get().getEndTime())) {
                return ApiResponse.error("活动已结束");
            }
            
            // 验证密码
            if (!activity.get().getPassword().equals(request.getPassword())) {
                return ApiResponse.error("活动密码错误");
            }
            
            return ApiResponse.ok(true);
        } catch (Exception e) {
            logger.error("验证活动密码失败", e);
            return ApiResponse.error("验证活动密码失败: " + e.getMessage());
        }
    }

    /**
     * 获取活动房间列表
     * @param id 活动ID
     * @return API response json
     */
    @GetMapping("/{id}/rooms")
    public ApiResponse getActivityRooms(@PathVariable Integer id) {
        logger.info("/api/activity/{}/rooms get request", id);
        
        try {
            Optional<Activity> activity = activityService.getActivityById(id);
            if (!activity.isPresent()) {
                return ApiResponse.error("活动不存在");
            }
            
            List<Room> rooms = roomService.getRoomsByActivityId(id);
            
            Map<String, Object> result = new HashMap<>();
            result.put("activity", activity.get());
            result.put("rooms", rooms);
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            logger.error("获取活动房间列表失败", e);
            return ApiResponse.error("获取活动房间列表失败: " + e.getMessage());
        }
    }

    /**
     * 抢房
     * @param request {@link GrabRequest}
     * @return API response json
     */
    @PostMapping("/grab")
    public ApiResponse grabRooms(@RequestBody GrabRequest request) {
        logger.info("/api/activity/grab post request, activityId: {}, roomIds: {}", 
                   request.getActivityId(), request.getRoomIds());
        
        try {
            Optional<Activity> activity = activityService.getActivityById(request.getActivityId());
            if (!activity.isPresent()) {
                return ApiResponse.error("活动不存在");
            }
            
            // 验证活动状态
            if (!"active".equals(activity.get().getStatus())) {
                return ApiResponse.error("活动已结束");
            }
            
            // 验证活动时间
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(activity.get().getStartTime())) {
                return ApiResponse.error("活动尚未开始");
            }
            if (now.isAfter(activity.get().getEndTime())) {
                return ApiResponse.error("活动已结束");
            }
            
            // 验证密码
            if (!activity.get().getPassword().equals(request.getPassword())) {
                return ApiResponse.error("活动密码错误");
            }
            
            // 验证房间状态
            List<Room> rooms = roomService.getRoomsByIds(request.getRoomIds());
            for (Room room : rooms) {
                if (!"available".equals(room.getStatus())) {
                    return ApiResponse.error("房间" + room.getRoomNumber() + "已被抢购");
                }
            }
            
            // 抢房
            int updatedCount = roomService.batchUpdateRoomStatus(
                request.getRoomIds(), "grabbed", request.getPhoneNumber());
            
            if (updatedCount != request.getRoomIds().size()) {
                return ApiResponse.error("部分房间抢购失败，请刷新后重试");
            }
            
            // 获取更新后的房间信息
            List<Room> updatedRooms = roomService.getRoomsByIds(request.getRoomIds());
            
            return ApiResponse.ok(updatedRooms);
        } catch (Exception e) {
            logger.error("抢房失败", e);
            return ApiResponse.error("抢房失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户抢购记录
     * @param phoneNumber 手机号
     * @return API response json
     */
    @GetMapping("/record/{phoneNumber}")
    public ApiResponse getUserGrabRecords(@PathVariable String phoneNumber) {
        logger.info("/api/activity/record/{} get request", phoneNumber);
        
        try {
            List<Room> rooms = roomService.getRoomsByPhoneNumber(phoneNumber);
            
            // 获取相关活动信息
            Map<Integer, Activity> activityMap = new HashMap<>();
            for (Room room : rooms) {
                if (!activityMap.containsKey(room.getActivityId())) {
                    Optional<Activity> activity = activityService.getActivityById(room.getActivityId());
                    activity.ifPresent(a -> activityMap.put(a.getId(), a));
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("rooms", rooms);
            result.put("activities", activityMap.values());
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            logger.error("获取用户抢购记录失败", e);
            return ApiResponse.error("获取用户抢购记录失败: " + e.getMessage());
        }
    }
}
