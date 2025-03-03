package com.tencent.wxcloudrun.dto;

/**
 * 验证密码请求
 */
public class VerifyPasswordRequest {
    private Integer activityId;
    private String password;
    private String phoneNumber;

    public Integer getActivityId() {
        return activityId;
    }

    public void setActivityId(Integer activityId) {
        this.activityId = activityId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
