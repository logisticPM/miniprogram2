package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Room;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface RoomService {

    /**
     * 创建房间
     * @param room 房间信息
     * @return 创建后的房间
     */
    Room createRoom(Room room);

    /**
     * 批量创建房间
     * @param rooms 房间列表
     * @return 创建的房间数量
     */
    int batchCreateRooms(List<Room> rooms);

    /**
     * 根据ID获取房间
     * @param id 房间ID
     * @return 房间信息
     */
    Room getRoomById(Integer id);

    /**
     * 根据活动ID获取房间列表
     * @param activityId 活动ID
     * @return 房间列表
     */
    List<Room> getRoomsByActivityId(Integer activityId);

    /**
     * 根据活动ID获取可用房间列表
     * @param activityId 活动ID
     * @return 可用房间列表
     */
    List<Room> getAvailableRoomsByActivityId(Integer activityId);

    /**
     * 根据ID列表获取房间列表
     * @param ids ID列表
     * @return 房间列表
     */
    List<Room> getRoomsByIds(List<Integer> ids);

    /**
     * 更新房间状态
     * @param id 房间ID
     * @param status 状态
     * @param phoneNumber 手机号（可选）
     * @return 是否更新成功
     */
    boolean updateRoomStatus(Integer id, String status, String phoneNumber);

    /**
     * 批量更新房间状态
     * @param ids 房间ID列表
     * @param status 状态
     * @param phoneNumber 手机号（可选）
     * @return 更新的房间数量
     */
    int batchUpdateRoomStatus(List<Integer> ids, String status, String phoneNumber);

    /**
     * 根据手机号获取房间列表
     * @param phoneNumber 手机号
     * @return 房间列表
     */
    List<Room> getRoomsByPhoneNumber(String phoneNumber);
    
    /**
     * 获取用户的抢房记录
     * @param phoneNumber 手机号
     * @return 抢房记录列表
     */
    List<Map<String, Object>> getUserGrabRecords(String phoneNumber);
}
