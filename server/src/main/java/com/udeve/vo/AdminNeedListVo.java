package com.udeve.vo;
/**
 * +----------------------------------------------------------------------
 * | 友得云客  - 开启房产营销新纪元
 * +----------------------------------------------------------------------
 * | Copyright (c) 2019~2023 优得（西安）信息科技有限公司版权所有
 * +----------------------------------------------------------------------
 * | Licensed 友得云客不是自有软件 未经允许不可移除相关版权
 * +----------------------------------------------------------------------
 * | Author: www.youdeyunke.com
 * +----------------------------------------------------------------------
 */

import lombok.Data;

import javax.persistence.Column;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class AdminNeedListVo implements Serializable {

    public Integer id;

    public String name;
    public String mobile;
    public Integer cityId;
    public String position;
    public String points;
    public Integer budgetMin;
    public Integer budgetMax;
    public String area;
    public String housetype;
    public String cityName;

    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

}
