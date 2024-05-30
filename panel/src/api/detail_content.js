/**
* +----------------------------------------------------------------------
* | 友得云客  - 开启房产营销新纪元
* +----------------------------------------------------------------------
* | Copyright (c) 2019~2023 优得（西安）信息科技有限公司版权所有
* +----------------------------------------------------------------------
* | Licensed 友得云客不是自由软件 未经允许不可移除相关版权
* +----------------------------------------------------------------------
* | Author: www.youdeyunke.com
* +----------------------------------------------------------------------
*/
import request from '@/utils/request'

export function getDetailContent (id) {
    return request({
        url: '/admin6/detail_content/' + id,
        method: 'GET',
    })
}

export function updateDetailContent (data) {
    return request({
        url: '/admin6/detail_content/' + data.id,
        method: 'PATCH',
        data: data
    })
}