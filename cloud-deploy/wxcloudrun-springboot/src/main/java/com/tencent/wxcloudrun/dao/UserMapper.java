package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户数据访问接口
 */
@Mapper
public interface UserMapper {

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * @return 用户信息
     */
    User getById(@Param("id") Integer id);

    /**
     * 根据手机号获取用户
     * @param phoneNumber 手机号
     * @return 用户信息
     */
    User getByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    /**
     * 插入用户
     * @param user 用户信息
     * @return 影响的行数
     */
    int insert(User user);

    /**
     * 更新用户
     * @param user 用户信息
     * @return 影响的行数
     */
    int updateById(User user);
}
