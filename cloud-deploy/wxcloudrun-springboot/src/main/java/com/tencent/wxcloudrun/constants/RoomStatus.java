package com.tencent.wxcloudrun.constants;

/**
 * 房间状态常量
 */
public class RoomStatus {
    /**
     * 待售状态
     */
    public static final String AVAILABLE = "available";
    
    /**
     * 已占状态（已被抢但未完成后续流程）
     */
    public static final String GRABBED = "grabbed";
    
    /**
     * 已售状态（完成所有流程）
     */
    public static final String SOLD = "sold";
}
