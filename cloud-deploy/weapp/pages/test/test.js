// pages/test/test.js
const app = getApp();
const request = require('../../utils/request');
const config = require('../../config');

Page({
    data: {
        // 基础数据
        title: '小程序组件测试',
        loading: false,

        // 表单数据
        formData: {
            name: '',
            phone: '',
            address: '',
            date: '2023-01-01',
            time: '12:00',
            region: ['广东省', '广州市', '海珠区'],
            switch: false
        },

        // 列表数据
        listData: [],

        // 选择器数据
        pickerItems: ['选项1', '选项2', '选项3', '选项4', '选项5'],
        pickerIndex: 0,

        // 图片数据
        imageList: [],

        // 测试结果
        testResult: '',
        testSuccess: false
    },

    onLoad: function () {
        // 初始化测试数据
        this.initTestData();

        // 打印调试信息
        console.log('[DEBUG] 测试页面加载完成');
    },

    // 初始化测试数据
    initTestData: function () {
        // 生成测试列表数据
        const listData = [];
        for (let i = 1; i <= 10; i++) {
            listData.push({
                id: i,
                title: `测试项目 ${i}`,
                desc: `这是测试项目 ${i} 的描述信息`,
                time: new Date().toLocaleString()
            });
        }

        this.setData({
            listData,
            testResult: '测试页面初始化完成'
        });
    },

    // 表单输入处理
    onInput: function (e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;

        this.setData({
            [`formData.${field}`]: value
        });

        console.log(`[DEBUG] 表单字段 ${field} 更新为: ${value}`);
    },

    // 切换开关
    onSwitchChange: function (e) {
        this.setData({
            'formData.switch': e.detail.value
        });

        console.log(`[DEBUG] 开关状态更新为: ${e.detail.value}`);
    },

    // 选择器变化
    onPickerChange: function (e) {
        this.setData({
            pickerIndex: e.detail.value
        });

        console.log(`[DEBUG] 选择器选中: ${this.data.pickerItems[e.detail.value]}`);
    },

    // 地区选择器变化
    onRegionChange: function (e) {
        this.setData({
            'formData.region': e.detail.value
        });

        console.log(`[DEBUG] 地区选择: ${e.detail.value.join(', ')}`);
    },

    // 日期选择器变化
    onDateChange: function (e) {
        this.setData({
            'formData.date': e.detail.value
        });

        console.log(`[DEBUG] 日期选择: ${e.detail.value}`);
    },

    // 时间选择器变化
    onTimeChange: function (e) {
        this.setData({
            'formData.time': e.detail.value
        });

        console.log(`[DEBUG] 时间选择: ${e.detail.value}`);
    },

    // 选择图片
    chooseImage: function () {
        const that = this;
        wx.chooseMedia({
            count: 9,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                const tempFiles = res.tempFiles;
                const imageList = tempFiles.map(file => file.tempFilePath);

                that.setData({
                    imageList: [...that.data.imageList, ...imageList]
                });

                console.log(`[DEBUG] 已选择 ${imageList.length} 张图片`);
            }
        });
    },

    // 删除图片
    deleteImage: function (e) {
        const { index } = e.currentTarget.dataset;
        const imageList = this.data.imageList;
        imageList.splice(index, 1);

        this.setData({
            imageList
        });

        console.log(`[DEBUG] 已删除第 ${index + 1} 张图片`);
    },

    // 预览图片
    previewImage: function (e) {
        const { url } = e.currentTarget.dataset;
        wx.previewImage({
            current: url,
            urls: this.data.imageList
        });

        console.log(`[DEBUG] 预览图片: ${url}`);
    },

    // 提交表单
    submitForm: function () {
        const formData = this.data.formData;

        // 表单验证
        if (!formData.name) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            });
            return;
        }

        if (!formData.phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }

        // 显示加载状态
        this.setData({
            loading: true
        });

        // 模拟API请求
        setTimeout(() => {
            // 隐藏加载状态
            this.setData({
                loading: false,
                testResult: JSON.stringify(formData, null, 2),
                testSuccess: true
            });

            // 显示成功提示
            wx.showToast({
                title: '提交成功',
                icon: 'success'
            });

            console.log('[DEBUG] 表单提交成功:', formData);
        }, 1500);
    },

    // 测试API请求
    testApiRequest: function () {
        // 显示加载状态
        this.setData({
            loading: true,
            testSuccess: false
        });

        // 调用计数器API
        request.post('/api/count', { action: 'inc' })
            .then(res => {
                console.log('[DEBUG] API请求成功:', res);

                this.setData({
                    loading: false,
                    testResult: JSON.stringify(res, null, 2),
                    testSuccess: true
                });

                wx.showToast({
                    title: 'API请求成功',
                    icon: 'success'
                });
            })
            .catch(err => {
                console.error('[ERROR] API请求失败:', err);

                this.setData({
                    loading: false,
                    testResult: JSON.stringify(err, null, 2),
                    testSuccess: false
                });

                wx.showToast({
                    title: 'API请求失败',
                    icon: 'error'
                });
            });
    },

    // 测试页面跳转
    navigateToIndex: function () {
        wx.navigateTo({
            url: '/pages/index/index',
            success: function () {
                console.log('[DEBUG] 页面跳转成功');
            },
            fail: function (err) {
                console.error('[ERROR] 页面跳转失败:', err);
            }
        });
    },

    // 测试显示模态框
    showModal: function () {
        wx.showModal({
            title: '测试模态框',
            content: '这是一个测试模态框，用于测试交互逻辑',
            confirmText: '确定',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {
                    console.log('[DEBUG] 用户点击确定');
                } else if (res.cancel) {
                    console.log('[DEBUG] 用户点击取消');
                }
            }
        });
    },

    // 测试显示操作菜单
    showActionSheet: function () {
        wx.showActionSheet({
            itemList: ['选项1', '选项2', '选项3'],
            success: function (res) {
                console.log('[DEBUG] 用户选择了第', res.tapIndex + 1, '个选项');
            },
            fail: function (err) {
                console.error('[ERROR] 操作菜单显示失败:', err);
            }
        });
    },

    // 分享页面
    onShareAppMessage: function () {
        return {
            title: '小程序测试页面',
            path: '/pages/test/test',
            success: function () {
                console.log('[DEBUG] 分享成功');
            },
            fail: function (err) {
                console.error('[ERROR] 分享失败:', err);
            }
        };
    }
}) 