const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');

Page({
    data: {
        id: '',
        activity: null,
        loading: true,
        formData: {
            name: '',
            phone: '',
            idCard: ''
        },
        submitting: false,
        password: '',
        showResult: false,
        countdown: 0
    },

    onLoad: function (options) {
        if (options.id) {
            this.setData({ id: options.id });
            this.loadActivityDetail();
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

    onInput: function (e) {
        const field = e.currentTarget.dataset.field;
        const value = e.detail.value;
        this.setData({
            [`formData.${field}`]: value
        });
    },

    submitForm: function () {
        // 表单验证
        const { name, phone, idCard } = this.data.formData;

        if (!name.trim()) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            });
            return;
        }

        if (!phone.trim()) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }

        if (!/^1\d{10}$/.test(phone)) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none'
            });
            return;
        }

        if (!idCard.trim()) {
            wx.showToast({
                title: '请输入身份证号',
                icon: 'none'
            });
            return;
        }

        if (!/^\d{17}[\dXx]$/.test(idCard)) {
            wx.showToast({
                title: '身份证号格式不正确',
                icon: 'none'
            });
            return;
        }

        this.setData({ submitting: true });

        // 模拟API请求
        setTimeout(() => {
            // 生成随机密码
            const password = this.generateRandomPassword();

            this.setData({
                submitting: false,
                password: password,
                showResult: true,
                countdown: 300 // 5分钟倒计时
            });

            // 开始倒计时
            this.startCountdown();
        }, 2000);

        // 实际API请求代码（暂时注释）
        /*
        return request.post(`/api/activities/${this.data.id}/get-password`, this.data.formData).then(res => {
          if (res.code === 200) {
            this.setData({
              submitting: false,
              password: res.data.password,
              showResult: true,
              countdown: 300 // 5分钟倒计时
            });
            
            // 开始倒计时
            this.startCountdown();
          } else {
            this.setData({ submitting: false });
            
            wx.showModal({
              title: '获取密码失败',
              content: res.message || '获取密码失败，请重试',
              showCancel: false
            });
          }
        }).catch(err => {
          console.error('[ERROR] 获取密码失败', err);
          this.setData({ submitting: false });
          
          wx.showModal({
            title: '获取密码失败',
            content: '网络错误，请重试',
            showCancel: false
          });
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
                this.setData({
                    showResult: false,
                    password: ''
                });
            }
        }, 1000);
    },

    copyPassword: function () {
        wx.setClipboardData({
            data: this.data.password,
            success: () => {
                wx.showToast({
                    title: '密码已复制',
                    icon: 'success'
                });
            }
        });
    },

    goToGrab: function () {
        wx.navigateBack();
    },

    // 生成模拟活动数据
    generateMockActivity: function () {
        const id = this.data.id;
        const index = parseInt(id.split('_')[1]) || 0;

        return {
            id: id,
            title: `${index + 1}期房源抢购活动`,
            coverImage: `/assets/images/activity_${(index % 5) + 1}.jpg`
        };
    },

    // 生成随机密码
    generateRandomPassword: function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';

        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password;
    },

    // 格式化倒计时
    formatCountdown: function () {
        const minutes = Math.floor(this.data.countdown / 60);
        const seconds = this.data.countdown % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}); 