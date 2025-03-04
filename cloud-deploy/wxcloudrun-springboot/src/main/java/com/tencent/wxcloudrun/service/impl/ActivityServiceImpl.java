package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.constants.ActivityStatus;
import com.tencent.wxcloudrun.dao.ActivityMapper;
import com.tencent.wxcloudrun.model.Activity;
import com.tencent.wxcloudrun.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivityServiceImpl implements ActivityService {

    private final ActivityMapper activityMapper;

    public ActivityServiceImpl(@Autowired ActivityMapper activityMapper) {
        this.activityMapper = activityMapper;
    }

    @Override
    public Activity createActivity(Activity activity) {
        activityMapper.createActivity(activity);
        return activity;
    }

    @Override
    public Optional<Activity> getActivityById(Integer id) {
        return activityMapper.getActivityById(id);
    }

    @Override
    public List<Activity> getAllActivities() {
        return activityMapper.getAllActivities();
    }

    @Override
    public List<Activity> getActiveActivities() {
        return activityMapper.getActiveActivities(ActivityStatus.IN_PROGRESS);
    }

    @Override
    public Activity updateActivity(Activity activity) {
        activityMapper.updateActivity(activity);
        return activity;
    }

    @Override
    public boolean updateActivityStatus(Integer id, String status) {
        return activityMapper.updateActivityStatus(id, status) > 0;
    }
}
