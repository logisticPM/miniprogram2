const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');

Page({
    data: {
        id: '',
        activity: null,
        houses: [],
        loading: true,
        passwordModalVisible: false,
        password: '',
        verifying: false,
        verifyResult: '',
        verifySuccess: false,
        selectedHouseId: '',
        confirmModalVisible: false,
        grabbing: false
    },

    onLoad: function (options) {
        if (options.id) {
            this.setData({ id: options.id });
            this.loadActivityDetail();
            this.loadHouses();
        } else {
            wx.showToast({
                title: '参数错误',
                icon: 'none'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }
    },

    loadActivityDetail: function () {
        this.setData({ loading: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟数据
            const mockActivity = this.generateMockActivity();

            this.setData({
                activity: mockActivity,
                loading: false
            });
        }, 1000);

        // 实际API请求代码（暂时注释）
        /*
        return request.get(`/api/activities/${this.data.id}`).then(res => {
          if (res.code === 200) {
            this.setData({
              activity: res.data,
              loading: false
            });
          } else {
            wx.showToast({
              title: res.message || '加载失败',
              icon: 'none'
            });
            this.setData({ loading: false });
          }
        }).catch(err => {
          console.error('[ERROR] 加载活动详情失败', err);
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
          this.setData({ loading: false });
        });
        */
    },

    loadHouses: function () {
        // 模拟API请求
        setTimeout(() => {
            // 模拟数据
            const mockHouses = this.generateMockHouses();

            this.setData({
                houses: mockHouses
            });
        }, 1200);

        // 实际API请求代码（暂时注释）
        /*
        return request.get(`/api/activities/${this.data.id}/houses`).then(res => {
          if (res.code === 200) {
            this.setData({
              houses: res.data
            });
          } else {
            wx.showToast({
              title: res.message || '加载房源失败',
              icon: 'none'
            });
          }
        }).catch(err => {
          console.error('[ERROR] 加载房源列表失败', err);
          wx.showToast({
            title: '加载房源失败，请重试',
            icon: 'none'
          });
        });
        */
    },

    showPasswordModal: function (e) {
        const houseId = e.currentTarget.dataset.id;

        // 检查活动状态
        if (this.data.activity.status !== '进行中') {
            let message = '';
            if (this.data.activity.status === '未开始') {
                message = '活动尚未开始，请等待活动开始后再参与';
            } else {
                message = '活动已结束，无法参与抢购';
            }

            wx.showToast({
                title: message,
                icon: 'none'
            });
            return;
        }

        // 检查房源状态
        const house = this.data.houses.find(h => h.id === houseId);
        if (house.status !== '可抢') {
            wx.showToast({
                title: '该房源已被抢购',
                icon: 'none'
            });
            return;
        }

        this.setData({
            passwordModalVisible: true,
            selectedHouseId: houseId,
            password: '',
            verifyResult: '',
            verifySuccess: false
        });
    },

    hidePasswordModal: function () {
        this.setData({
            passwordModalVisible: false,
            password: '',
            verifyResult: '',
            verifySuccess: false
        });
    },

    onPasswordInput: function (e) {
        this.setData({
            password: e.detail.value,
            verifyResult: '',
            verifySuccess: false
        });
    },

    verifyPassword: function () {
        if (!this.data.password.trim()) {
            this.setData({
                verifyResult: '请输入密码',
                verifySuccess: false
            });
            return;
        }

        this.setData({ verifying: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟验证结果（70%概率成功）
            const success = Math.random() < 0.7;

            this.setData({
                verifying: false,
                verifyResult: success ? '密码验证成功' : '密码错误，请重新输入',
                verifySuccess: success
            });

            if (success) {
                // 显示确认抢购弹窗
                setTimeout(() => {
                    this.hidePasswordModal();
                    this.showConfirmModal();
                }, 1000);
            }
        }, 1500);

        // 实际API请求代码（暂时注释）
        /*
        return request.post(`/api/activities/${this.data.id}/verify-password`, {
          password: this.data.password,
          houseId: this.data.selectedHouseId
        }).then(res => {
          if (res.code === 200) {
            this.setData({
              verifying: false,
              verifyResult: '密码验证成功',
              verifySuccess: true
            });
            
            // 显示确认抢购弹窗
            setTimeout(() => {
              this.hidePasswordModal();
              this.showConfirmModal();
            }, 1000);
          } else {
            this.setData({
              verifying: false,
              verifyResult: res.message || '密码错误，请重新输入',
              verifySuccess: false
            });
          }
        }).catch(err => {
          console.error('[ERROR] 验证密码失败', err);
          this.setData({
            verifying: false,
            verifyResult: '验证失败，请重试',
            verifySuccess: false
          });
        });
        */
    },

    showConfirmModal: function () {
        this.setData({
            confirmModalVisible: true
        });
    },

    hideConfirmModal: function () {
        this.setData({
            confirmModalVisible: false
        });
    },

    grabHouse: function () {
        this.setData({ grabbing: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟抢购结果（80%概率成功）
            const success = Math.random() < 0.8;

            if (success) {
                // 更新房源状态
                const houses = this.data.houses.map(house => {
                    if (house.id === this.data.selectedHouseId) {
                        return {
                            ...house,
                            status: '已抢',
                            soldTime: new Date().toLocaleString(),
                            soldTo: 'current_user'
                        };
                    }
                    return house;
                });

                // 更新活动剩余房源数
                const activity = {
                    ...this.data.activity,
                    remainingHouses: this.data.activity.remainingHouses - 1
                };

                this.setData({
                    houses,
                    activity,
                    grabbing: false,
                    confirmModalVisible: false
                });

                wx.showToast({
                    title: '抢购成功',
                    icon: 'success'
                });

                // 跳转到抢购成功页面
                setTimeout(() => {
                    wx.navigateTo({
                        url: `/pages/activity/success/success?houseId=${this.data.selectedHouseId}&activityId=${this.data.id}`
                    });
                }, 1500);
            } else {
                this.setData({
                    grabbing: false,
                    confirmModalVisible: false
                });

                wx.showModal({
                    title: '抢购失败',
                    content: '很抱歉，该房源已被他人抢先一步，请选择其他房源',
                    showCancel: false,
                    success: () => {
                        // 重新加载房源列表
                        this.loadHouses();
                    }
                });
            }
        }, 2000);

        // 实际API请求代码（暂时注释）
        /*
        return request.post(`/api/activities/${this.data.id}/grab-house`, {
          houseId: this.data.selectedHouseId,
          password: this.data.password
        }).then(res => {
          if (res.code === 200) {
            this.setData({
              grabbing: false,
              confirmModalVisible: false
            });
            
            wx.showToast({
              title: '抢购成功',
              icon: 'success'
            });
            
            // 重新加载房源列表
            this.loadHouses();
            
            // 跳转到抢购成功页面
            setTimeout(() => {
              wx.navigateTo({
                url: `/pages/activity/success/success?houseId=${this.data.selectedHouseId}&activityId=${this.data.id}`
              });
            }, 1500);
          } else {
            this.setData({
              grabbing: false,
              confirmModalVisible: false
            });
            
            wx.showModal({
              title: '抢购失败',
              content: res.message || '抢购失败，请重试',
              showCancel: false,
              success: () => {
                // 重新加载房源列表
                this.loadHouses();
              }
            });
          }
        }).catch(err => {
          console.error('[ERROR] 抢购房源失败', err);
          this.setData({
            grabbing: false,
            confirmModalVisible: false
          });
          
          wx.showModal({
            title: '抢购失败',
            content: '网络错误，请重试',
            showCancel: false
          });
        });
        */
    },

    getPassword: function () {
        wx.navigateTo({
            url: `/pages/activity/password/password?id=${this.data.id}`
        });
    },

    previewHouseImage: function (e) {
        const url = e.currentTarget.dataset.url;
        const urls = e.currentTarget.dataset.urls;

        wx.previewImage({
            current: url,
            urls: urls
        });
    },

    // 生成模拟活动数据
    generateMockActivity: function () {
        const id = this.data.id;
        const index = parseInt(id.split('_')[1]) || 0;
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

        return {
            id: id,
            title: `${index + 1}期房源抢购活动`,
            description: `这是第${index + 1}期房源抢购活动，共有${totalHouses}套房源，先到先得！`,
            startTime: startTime.toLocaleString(),
            endTime: endTime.toLocaleString(),
            status: status,
            totalHouses: totalHouses,
            remainingHouses: remainingHouses,
            coverImage: `/assets/images/activity_${(index % 5) + 1}.jpg`,
            rules: `
1. 每位用户需要获取专属密码才能参与抢购
2. 每个密码只能使用一次
3. 抢购成功后，需在24小时内完成签约
4. 每位用户限购一套房源
5. 活动最终解释权归开发商所有
      `,
            contact: {
                name: '售楼部',
                phone: '400-123-4567',
                address: '示例市示例区示例路123号'
            }
        };
    },

    // 生成模拟房源数据
    generateMockHouses: function () {
        const mockHouses = [];
        const activityId = this.data.id;
        const count = Math.floor(Math.random() * 20) + 5;

        const houseTypes = ['一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '四室两厅'];
        const features = ['南北通透', '精装修', '拎包入住', '地铁口', '学区房', '公园旁', '河景房', '低总价'];

        for (let i = 0; i < count; i++) {
            // 随机状态
            let status;
            const random = Math.random();
            if (random < 0.6) {
                status = '可抢';
            } else {
                status = '已抢';
            }

            // 随机特点
            const houseFeatures = [];
            const featureCount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < featureCount; j++) {
                const feature = features[Math.floor(Math.random() * features.length)];
                if (!houseFeatures.includes(feature)) {
                    houseFeatures.push(feature);
                }
            }

            // 随机图片
            const imageCount = Math.floor(Math.random() * 3) + 1;
            const images = [];
            for (let j = 0; j < imageCount; j++) {
                images.push(`/assets/images/house_${(i % 5) + 1}_${j + 1}.jpg`);
            }

            mockHouses.push({
                id: `house_${activityId}_${i}`,
                activityId: activityId,
                title: `${i + 1}号房源`,
                address: `示例市示例区示例路${i + 1}号`,
                area: Math.floor(Math.random() * 100) + 50,
                price: Math.floor(Math.random() * 500) + 100,
                type: houseTypes[Math.floor(Math.random() * houseTypes.length)],
                images: images,
                status: status,
                features: houseFeatures,
                soldTime: status === '已抢' ? new Date().toLocaleString() : '',
                soldTo: status === '已抢' ? 'user_' + Math.floor(Math.random() * 1000) : ''
            });
        }

        return mockHouses;
    }
}); 