package com.tencent.wxcloudrun.dto;

import java.util.List;
import java.util.Map;

/**
 * 抢房活动请求
 */
public class ActivityRequest {
    private String title;
    private String startTime;
    private String endTime;
    private String password;
    private String adminPassword;
    private String buildingNumber;
    private Integer unitCount;
    private Integer floorCount;
    private List<String> houseTypes;
    private Map<String, Object> buildingInfo;
    private List<Map<String, Object>> rooms;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public String getBuildingNumber() {
        return buildingNumber;
    }

    public void setBuildingNumber(String buildingNumber) {
        this.buildingNumber = buildingNumber;
    }

    public Integer getUnitCount() {
        return unitCount;
    }

    public void setUnitCount(Integer unitCount) {
        this.unitCount = unitCount;
    }

    public Integer getFloorCount() {
        return floorCount;
    }

    public void setFloorCount(Integer floorCount) {
        this.floorCount = floorCount;
    }

    public List<String> getHouseTypes() {
        return houseTypes;
    }

    public void setHouseTypes(List<String> houseTypes) {
        this.houseTypes = houseTypes;
    }

    public Map<String, Object> getBuildingInfo() {
        return buildingInfo;
    }

    public void setBuildingInfo(Map<String, Object> buildingInfo) {
        this.buildingInfo = buildingInfo;
    }

    public List<Map<String, Object>> getRooms() {
        return rooms;
    }

    public void setRooms(List<Map<String, Object>> rooms) {
        this.rooms = rooms;
    }
}
