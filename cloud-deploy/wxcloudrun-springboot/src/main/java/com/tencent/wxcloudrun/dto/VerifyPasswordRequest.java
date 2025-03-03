package com.tencent.wxcloudrun.dto;

/**
 * 验证密码请求
 */
public class VerifyPasswordRequest {
    private String password;
    private String phoneNumber;

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
