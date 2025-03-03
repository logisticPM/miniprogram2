const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');

Page({
    data: {
        activities: [],
        loading: true,
        pageNum: 1,
        pageSize: 10,
        hasMore: true,
        loadingMore: false,
        refreshing: false
    },

    onLoad: function (options) {
        this.loadActivities();
    },

    onPullDownRefresh: function () {
        this.setData({
            refreshing: true,
            pageNum: 1,
            activities: [],
            hasMore: true
        });
        this.loadActivities().then(() => {
            wx.stopPullDownRefresh();
            this.setData({ refreshing: false });
        });
    },

    onReachBottom: function () {
        if (this.data.hasMore && !this.data.loadingMore) {
            this.setData({ loadingMore: true });
            this.loadMoreActivities();
        }
    },

    loadActivities: function () {
        this.setData({ loading: true });

        // 模拟API请求
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟数据
                const mockActivities = this.generateMockActivities();

                this.setData({
                    activities: mockActivities,
                    loading: false,
                    hasMore: mockActivities.length >= this.data.pageSize
                });
                resolve();
            }, 1000);
        });

        // 实际API请求代码（暂时注释）
        /*
        return request.get('/api/activities', {
          pageNum: this.data.pageNum,
          pageSize: this.data.pageSize
        }).then(res => {
          if (res.code === 200) {
            this.setData({
              activities: res.data.list,
              loading: false,
              hasMore: res.data.hasMore
            });
          } else {
            wx.showToast({
              title: res.message || '加载失败',
              icon: 'none'
            });
            this.setData({ loading: false });
          }
        }).catch(err => {
          console.error('[ERROR] 加载活动列表失败', err);
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
          this.setData({ loading: false });
        });
        */
    },

    loadMoreActivities: function () {
        // 模拟加载更多
        setTimeout(() => {
            const nextPage = this.data.pageNum + 1;
            const mockMoreActivities = this.generateMockActivities(nextPage);

            this.setData({
                activities: [...this.data.activities, ...mockMoreActivities],
                pageNum: nextPage,
                loadingMore: false,
                hasMore: mockMoreActivities.length >= this.data.pageSize
            });
        }, 1000);

        // 实际API请求代码（暂时注释）
        /*
        const nextPage = this.data.pageNum + 1;
        return request.get('/api/activities', {
          pageNum: nextPage,
          pageSize: this.data.pageSize
        }).then(res => {
          if (res.code === 200) {
            this.setData({
              activities: [...this.data.activities, ...res.data.list],
              pageNum: nextPage,
              loadingMore: false,
              hasMore: res.data.hasMore
            });
          } else {
            wx.showToast({
              title: res.message || '加载失败',
              icon: 'none'
            });
            this.setData({ loadingMore: false });
          }
        }).catch(err => {
          console.error('[ERROR] 加载更多活动失败', err);
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
          this.setData({ loadingMore: false });
        });
        */
    },

    navigateToDetail: function (e) {
        const activityId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/activity/detail/detail?id=${activityId}`
        });
    },

    // 生成模拟数据
    generateMockActivities: function (page = 1) {
        const mockActivities = [];
        const baseIndex = (page - 1) * this.data.pageSize;
        const count = page === 1 ? this.data.pageSize : Math.floor(Math.random() * this.data.pageSize) + 1;

        for (let i = 0; i < count; i++) {
            const index = baseIndex + i;
            const now = new Date();
            const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000 * (index % 3));
            const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000 * 7);

            // 随机状态
            let status;
            const random = Math.random();
            if (random < 0.3) {
                status = '未开始';
            } else if (random < 0.7) {
                status = '进行中';
            } else {
                status = '已结束';
            }

            // 随机剩余房源
            const totalHouses = Math.floor(Math.random() * 50) + 10;
            const remainingHouses = status === '已结束' ? 0 : Math.floor(Math.random() * totalHouses);

            mockActivities.push({
                id: `activity_${index}`,
                title: `${index + 1}期房源抢购活动`,
                description: `这是第${index + 1}期房源抢购活动，共有${totalHouses}套房源，先到先得！`,
                startTime: startTime.toLocaleString(),
                endTime: endTime.toLocaleString(),
                status: status,
                totalHouses: totalHouses,
                remainingHouses: remainingHouses,
                coverImage: `/assets/images/activity_${(index % 5) + 1}.jpg`
            });
        }

        return mockActivities;
    }
}); 