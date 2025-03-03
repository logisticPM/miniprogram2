package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.RoomMapper;
import com.tencent.wxcloudrun.model.Room;
import com.tencent.wxcloudrun.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomMapper roomMapper;

    public RoomServiceImpl(@Autowired RoomMapper roomMapper) {
        this.roomMapper = roomMapper;
    }

    @Override
    public Room createRoom(Room room) {
        roomMapper.createRoom(room);
        return room;
    }

    @Override
    @Transactional
    public int batchCreateRooms(List<Room> rooms) {
        if (rooms == null || rooms.isEmpty()) {
            return 0;
        }
        return roomMapper.batchCreateRooms(rooms);
    }

    @Override
    public Room getRoomById(Integer id) {
        return roomMapper.getRoomById(id);
    }

    @Override
    public List<Room> getRoomsByActivityId(Integer activityId) {
        return roomMapper.getRoomsByActivityId(activityId);
    }

    @Override
    public List<Room> getAvailableRoomsByActivityId(Integer activityId) {
        return roomMapper.getAvailableRoomsByActivityId(activityId);
    }

    @Override
    public List<Room> getRoomsByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return roomMapper.getRoomsByIds(ids);
    }

    @Override
    public boolean updateRoomStatus(Integer id, String status, String phoneNumber) {
        return roomMapper.updateRoomStatus(id, status, phoneNumber) > 0;
    }

    @Override
    @Transactional
    public int batchUpdateRoomStatus(List<Integer> ids, String status, String phoneNumber) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return roomMapper.batchUpdateRoomStatus(ids, status, phoneNumber);
    }

    @Override
    public List<Room> getRoomsByPhoneNumber(String phoneNumber) {
        return roomMapper.getRoomsByPhoneNumber(phoneNumber);
    }
}
