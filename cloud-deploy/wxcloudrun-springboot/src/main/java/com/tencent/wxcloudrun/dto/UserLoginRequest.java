package com.tencent.wxcloudrun.dto;

/**
 * 用户登录请求
 */
public class UserLoginRequest {

    private String phoneNumber;
    private String openId;

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getOpenId() {
        return openId;
    }

    public void setOpenId(String openId) {
        this.openId = openId;
    }
}
