package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Room;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RoomMapper {

    /**
     * 创建房间
     * @param room 房间对象
     */
    void createRoom(Room room);

    /**
     * 批量创建房间
     * @param rooms 房间列表
     * @return 创建的行数
     */
    int batchCreateRooms(List<Room> rooms);

    /**
     * 根据ID获取房间
     * @param id 房间ID
     * @return 房间对象
     */
    Room getRoomById(@Param("id") Integer id);

    /**
     * 根据活动ID获取房间列表
     * @param activityId 活动ID
     * @return 房间列表
     */
    List<Room> getRoomsByActivityId(@Param("activityId") Integer activityId);

    /**
     * 根据活动ID获取可用房间列表
     * @param activityId 活动ID
     * @param availableStatus 可用状态
     * @return 可用房间列表
     */
    List<Room> getAvailableRoomsByActivityId(
            @Param("activityId") Integer activityId,
            @Param("availableStatus") String availableStatus);

    /**
     * 根据ID列表获取房间列表
     * @param ids ID列表
     * @return 房间列表
     */
    List<Room> getRoomsByIds(@Param("ids") List<Integer> ids);

    /**
     * 根据活动ID、楼号和楼层获取房间列表
     * @param activityId 活动ID
     * @param buildingNumber 楼号
     * @param floorNumber 楼层
     * @return 房间列表
     */
    List<Room> getRoomsByBuildingAndFloor(
            @Param("activityId") Integer activityId,
            @Param("buildingNumber") String buildingNumber,
            @Param("floorNumber") Integer floorNumber);

    /**
     * 更新房间
     * @param room 房间对象
     */
    void updateRoom(Room room);

    /**
     * 更新房间状态
     * @param id 房间ID
     * @param status 状态
     * @param phoneNumber 手机号
     * @param availableStatus 可用状态
     * @return 更新的行数
     */
    int updateRoomStatus(
            @Param("id") Integer id,
            @Param("status") String status,
            @Param("phoneNumber") String phoneNumber,
            @Param("availableStatus") String availableStatus);

    /**
     * 批量更新房间状态
     * @param ids 房间ID列表
     * @param status 状态
     * @param phoneNumber 手机号
     * @param availableStatus 可用状态
     * @return 更新的行数
     */
    int batchUpdateRoomStatus(
            @Param("ids") List<Integer> ids,
            @Param("status") String status,
            @Param("phoneNumber") String phoneNumber,
            @Param("availableStatus") String availableStatus);

    /**
     * 根据手机号获取房间列表
     * @param phoneNumber 手机号
     * @return 房间列表
     */
    List<Room> getRoomsByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    /**
     * 根据活动ID和手机号获取抢购记录
     * @param activityId 活动ID
     * @param phoneNumber 手机号
     * @return 房间列表
     */
    List<Room> getGrabRecordsByPhoneNumber(
            @Param("activityId") Integer activityId,
            @Param("phoneNumber") String phoneNumber);

    /**
     * 获取活动中的楼栋列表
     * @param activityId 活动ID
     * @return 楼栋列表
     */
    List<String> getBuildingsByActivityId(@Param("activityId") Integer activityId);

    /**
     * 获取活动中特定楼栋的楼层列表
     * @param activityId 活动ID
     * @param buildingNumber 楼号
     * @return 楼层列表
     */
    List<Integer> getFloorsByBuildingNumber(
            @Param("activityId") Integer activityId,
            @Param("buildingNumber") String buildingNumber);

    /**
     * 获取用户的抢房记录（包含活动信息）
     * @param phoneNumber 手机号
     * @return 抢房记录列表
     */
    List<Map<String, Object>> getUserGrabRecords(@Param("phoneNumber") String phoneNumber);
}
