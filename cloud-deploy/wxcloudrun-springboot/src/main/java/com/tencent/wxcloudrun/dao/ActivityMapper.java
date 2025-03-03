package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Activity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ActivityMapper {

    /**
     * 创建抢房活动
     * @param activity 活动对象
     */
    void createActivity(Activity activity);

    /**
     * 根据ID获取活动
     * @param id 活动ID
     * @return 活动对象
     */
    Optional<Activity> getActivityById(@Param("id") Integer id);

    /**
     * 根据状态获取活动列表
     * @param status 活动状态
     * @return 活动列表
     */
    List<Activity> getActivitiesByStatus(@Param("status") String status);

    /**
     * 获取所有活动
     * @return 活动列表
     */
    List<Activity> getAllActivities();

    /**
     * 更新活动
     * @param activity 活动对象
     */
    void updateActivity(Activity activity);

    /**
     * 根据密码获取活动
     * @param password 活动密码
     * @return 活动对象
     */
    Optional<Activity> getActivityByPassword(@Param("password") String password);
}
