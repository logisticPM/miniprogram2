package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.User;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 通过手机号登录
     * @param phoneNumber 手机号
     * @return 用户信息
     */
    User loginByPhoneNumber(String phoneNumber);

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * @return 用户信息
     */
    User getById(Integer id);

    /**
     * 根据手机号获取用户
     * @param phoneNumber 手机号
     * @return 用户信息
     */
    User getByPhoneNumber(String phoneNumber);

    /**
     * 创建用户
     * @param user 用户信息
     * @return 创建的用户
     */
    User createUser(User user);

    /**
     * 更新用户信息
     * @param user 用户信息
     * @return 更新后的用户
     */
    User updateUser(User user);
}
