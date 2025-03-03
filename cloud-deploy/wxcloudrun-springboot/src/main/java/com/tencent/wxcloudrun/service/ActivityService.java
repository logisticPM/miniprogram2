package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Activity;

import java.util.List;
import java.util.Optional;

public interface ActivityService {

    /**
     * 创建抢房活动
     * @param activity 活动信息
     * @return 创建后的活动
     */
    Activity createActivity(Activity activity);

    /**
     * 根据ID获取活动
     * @param id 活动ID
     * @return 活动信息
     */
    Optional<Activity> getActivityById(Integer id);

    /**
     * 获取所有活动
     * @return 活动列表
     */
    List<Activity> getAllActivities();

    /**
     * 获取所有活跃状态的活动
     * @return 活动列表
     */
    List<Activity> getActiveActivities();

    /**
     * 更新活动信息
     * @param activity 活动信息
     * @return 更新后的活动
     */
    Activity updateActivity(Activity activity);

    /**
     * 更新活动状态
     * @param id 活动ID
     * @param status 状态
     * @return 是否更新成功
     */
    boolean updateActivityStatus(Integer id, String status);
}
