const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');

Page({
    data: {
        activityId: '',
        houseId: '',
        activity: null,
        house: null,
        loading: true,
        countdown: 24 * 60 * 60 // 24小时倒计时（秒）
    },

    onLoad: function (options) {
        if (options.activityId && options.houseId) {
            this.setData({
                activityId: options.activityId,
                houseId: options.houseId
            });
            this.loadData();
            this.startCountdown();
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

    loadData: function () {
        this.setData({ loading: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟数据
            const mockActivity = this.generateMockActivity();
            const mockHouse = this.generateMockHouse();

            this.setData({
                activity: mockActivity,
                house: mockHouse,
                loading: false
            });
        }, 1000);

        // 实际API请求代码（暂时注释）
        /*
        Promise.all([
          request.get(`/api/activities/${this.data.activityId}`),
          request.get(`/api/houses/${this.data.houseId}`)
        ]).then(([activityRes, houseRes]) => {
          if (activityRes.code === 200 && houseRes.code === 200) {
            this.setData({
              activity: activityRes.data,
              house: houseRes.data,
              loading: false
            });
          } else {
            wx.showToast({
              title: '加载失败',
              icon: 'none'
            });
            this.setData({ loading: false });
          }
        }).catch(err => {
          console.error('[ERROR] 加载数据失败', err);
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
          this.setData({ loading: false });
        });
        */
    },

    startCountdown: function () {
        const timer = setInterval(() => {
            if (this.data.countdown > 0) {
                this.setData({
                    countdown: this.data.countdown - 1
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);
    },

    formatCountdown: function () {
        const hours = Math.floor(this.data.countdown / 3600);
        const minutes = Math.floor((this.data.countdown % 3600) / 60);
        const seconds = this.data.countdown % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    callSalesOffice: function () {
        if (this.data.activity && this.data.activity.contact) {
            wx.makePhoneCall({
                phoneNumber: this.data.activity.contact.phone,
                fail: (err) => {
                    console.error('[ERROR] 拨打电话失败', err);
                    wx.showToast({
                        title: '拨打电话失败',
                        icon: 'none'
                    });
                }
            });
        }
    },

    navigateToMap: function () {
        // 实际应用中应该使用真实的经纬度
        wx.openLocation({
            latitude: 39.908823,
            longitude: 116.397470,
            name: this.data.activity.contact.name,
            address: this.data.activity.contact.address,
            scale: 18
        });
    },

    backToList: function () {
        wx.navigateBack({
            delta: 2 // 返回到活动列表页
        });
    },

    // 生成模拟活动数据
    generateMockActivity: function () {
        const id = this.data.activityId;
        const index = parseInt(id.split('_')[1]) || 0;

        return {
            id: id,
            title: `${index + 1}期房源抢购活动`,
            coverImage: `/assets/images/activity_${(index % 5) + 1}.jpg`,
            contact: {
                name: '售楼部',
                phone: '400-123-4567',
                address: '示例市示例区示例路123号'
            }
        };
    },

    // 生成模拟房源数据
    generateMockHouse: function () {
        const id = this.data.houseId;
        const index = parseInt(id.split('_')[2]) || 0;

        const houseTypes = ['一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '四室两厅'];
        const features = ['南北通透', '精装修', '拎包入住', '地铁口', '学区房', '公园旁', '河景房', '低总价'];

        // 随机特点
        const houseFeatures = [];
        const featureCount = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < featureCount; i++) {
            const feature = features[Math.floor(Math.random() * features.length)];
            if (!houseFeatures.includes(feature)) {
                houseFeatures.push(feature);
            }
        }

        // 随机图片
        const imageCount = Math.floor(Math.random() * 3) + 1;
        const images = [];
        for (let i = 0; i < imageCount; i++) {
            images.push(`/assets/images/house_${(index % 5) + 1}_${i + 1}.jpg`);
        }

        return {
            id: id,
            activityId: this.data.activityId,
            title: `${index + 1}号房源`,
            address: `示例市示例区示例路${index + 1}号`,
            area: Math.floor(Math.random() * 100) + 50,
            price: Math.floor(Math.random() * 500) + 100,
            type: houseTypes[Math.floor(Math.random() * houseTypes.length)],
            images: images,
            features: houseFeatures,
            soldTime: new Date().toLocaleString(),
            contractDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()
        };
    }
}); 