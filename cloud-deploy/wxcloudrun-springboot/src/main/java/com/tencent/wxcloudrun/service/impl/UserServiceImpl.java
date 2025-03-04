package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.UserMapper;
import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements UserService {

    final UserMapper userMapper;

    public UserServiceImpl(@Autowired UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 通过手机号登录
     * @param phoneNumber 手机号
     * @return 用户信息
     */
    @Override
    public User loginByPhoneNumber(String phoneNumber) {
        // 查找用户
        User user = userMapper.getByPhoneNumber(phoneNumber);
        
        // 如果用户不存在，则创建
        if (user == null) {
            user = new User();
            user.setPhoneNumber(phoneNumber);
            user.setNickname("用户" + phoneNumber.substring(phoneNumber.length() - 4));
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            
            userMapper.insert(user);
            // 获取插入后的用户信息
            user = userMapper.getByPhoneNumber(phoneNumber);
        } else {
            // 更新登录时间
            user.setUpdateTime(LocalDateTime.now());
            userMapper.updateById(user);
        }
        
        return user;
    }

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * @return 用户信息
     */
    @Override
    public User getById(Integer id) {
        return userMapper.getById(id);
    }

    /**
     * 根据手机号获取用户
     * @param phoneNumber 手机号
     * @return 用户信息
     */
    @Override
    public User getByPhoneNumber(String phoneNumber) {
        return userMapper.getByPhoneNumber(phoneNumber);
    }

    /**
     * 创建用户
     * @param user 用户信息
     * @return 创建的用户
     */
    @Override
    public User createUser(User user) {
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.insert(user);
        return userMapper.getById(user.getId());
    }

    /**
     * 更新用户信息
     * @param user 用户信息
     * @return 更新后的用户
     */
    @Override
    public User updateUser(User user) {
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
        return userMapper.getById(user.getId());
    }
}
