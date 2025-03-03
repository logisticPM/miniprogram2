const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');
const activityService = require('../../../services/activity-service');

Page({
    data: {
        loading: false,
        submitting: false,
        formData: {
            title: '',
            startTime: '',
            endTime: '',
            buildingNumber: '',
            unitCount: 1,
            floorCount: 1,
            houseTypes: [
                { name: '01户型', selected: true },
                { name: '02户型', selected: true },
                { name: '03户型', selected: false },
                { name: '04户型', selected: false }
            ],
            password: ''
        },
        startDate: '',
        endDate: '',
        startTime: '08:00',
        endTime: '18:00',
        unitCountArray: [1, 2, 3, 4, 5, 6],
        floorCountArray: Array.from({ length: 30 }, (_, i) => i + 1),
        currentStep: 0,
        steps: ['基本信息', '楼栋信息', '密码设置'],
        generatedRooms: []
    },

    onLoad: function (options) {
        // 设置日期选择器的默认值和范围
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        this.setData({
            startDate: formatDate(today),
            endDate: formatDate(tomorrow),
            'formData.startTime': `${formatDate(today)} ${this.data.startTime}`,
            'formData.endTime': `${formatDate(tomorrow)} ${this.data.endTime}`
        });
    },

    // 输入框内容变化处理
    onInputChange: function (e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;

        this.setData({
            [`formData.${field}`]: value
        });
    },

    // 日期选择器变化处理
    onDateChange: function (e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;

        if (field === 'startDate') {
            this.setData({
                startDate: value,
                'formData.startTime': `${value} ${this.data.startTime}`
            });
        } else if (field === 'endDate') {
            this.setData({
                endDate: value,
                'formData.endTime': `${value} ${this.data.endTime}`
            });
        }
    },

    // 时间选择器变化处理
    onTimeChange: function (e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;

        if (field === 'startTime') {
            this.setData({
                startTime: value,
                'formData.startTime': `${this.data.startDate} ${value}`
            });
        } else if (field === 'endTime') {
            this.setData({
                endTime: value,
                'formData.endTime': `${this.data.endDate} ${value}`
            });
        }
    },

    // 单元数量选择器变化处理
    onUnitCountChange: function (e) {
        const index = e.detail.value;
        const unitCount = this.data.unitCountArray[index];

        this.setData({
            'formData.unitCount': unitCount
        });
    },

    // 楼层数量选择器变化处理
    onFloorCountChange: function (e) {
        const index = e.detail.value;
        const floorCount = this.data.floorCountArray[index];

        this.setData({
            'formData.floorCount': floorCount
        });
    },

    // 户型选择处理
    toggleHouseType: function (e) {
        const index = e.currentTarget.dataset.index;
        const selected = !this.data.formData.houseTypes[index].selected;

        this.setData({
            [`formData.houseTypes[${index}].selected`]: selected
        });
    },

    // 下一步
    nextStep: function () {
        const currentStep = this.data.currentStep;

        // 表单验证
        if (currentStep === 0) {
            // 验证基本信息
            if (!this.validateBasicInfo()) {
                return;
            }
        } else if (currentStep === 1) {
            // 验证楼栋信息
            if (!this.validateBuildingInfo()) {
                return;
            }

            // 生成房间预览
            this.generateRoomPreview();
        }

        if (currentStep < this.data.steps.length - 1) {
            this.setData({
                currentStep: currentStep + 1
            });
        }
    },

    // 上一步
    prevStep: function () {
        const currentStep = this.data.currentStep;

        if (currentStep > 0) {
            this.setData({
                currentStep: currentStep - 1
            });
        }
    },

    // 验证基本信息
    validateBasicInfo: function () {
        const { title, startTime, endTime } = this.data.formData;

        if (!title.trim()) {
            wx.showToast({
                title: '请输入活动标题',
                icon: 'none'
            });
            return false;
        }

        if (!startTime || !endTime) {
            wx.showToast({
                title: '请选择活动时间',
                icon: 'none'
            });
            return false;
        }

        const start = new Date(startTime.replace(' ', 'T'));
        const end = new Date(endTime.replace(' ', 'T'));

        if (start >= end) {
            wx.showToast({
                title: '结束时间必须晚于开始时间',
                icon: 'none'
            });
            return false;
        }

        return true;
    },

    // 验证楼栋信息
    validateBuildingInfo: function () {
        const { buildingNumber, unitCount, floorCount, houseTypes } = this.data.formData;

        if (!buildingNumber.trim()) {
            wx.showToast({
                title: '请输入楼号',
                icon: 'none'
            });
            return false;
        }

        if (!unitCount || unitCount < 1) {
            wx.showToast({
                title: '请选择单元数量',
                icon: 'none'
            });
            return false;
        }

        if (!floorCount || floorCount < 1) {
            wx.showToast({
                title: '请选择楼层数量',
                icon: 'none'
            });
            return false;
        }

        const selectedHouseTypes = houseTypes.filter(type => type.selected);
        if (selectedHouseTypes.length === 0) {
            wx.showToast({
                title: '请至少选择一种户型',
                icon: 'none'
            });
            return false;
        }

        return true;
    },

    // 生成房间预览
    generateRoomPreview: function () {
        const { buildingNumber, unitCount, floorCount, houseTypes } = this.data.formData;
        const selectedHouseTypes = houseTypes.filter(type => type.selected).map(type => type.name);

        const rooms = [];

        for (let unit = 1; unit <= unitCount; unit++) {
            for (let floor = 1; floor <= floorCount; floor++) {
                for (const houseType of selectedHouseTypes) {
                    // 从户型名称中提取编号（例如：从"01户型"提取"01"）
                    const typeNumber = houseType.replace(/[^0-9]/g, '');

                    // 生成房间号：楼层 + 户型编号
                    const roomNumber = `${floor}${typeNumber}`;

                    rooms.push({
                        buildingNumber,
                        unitNumber: unit,
                        floorNumber: floor,
                        roomNumber,
                        houseType
                    });
                }
            }
        }

        this.setData({
            generatedRooms: rooms
        });
    },

    // 提交表单
    submitForm: function () {
        const { password } = this.data.formData;

        if (!password.trim()) {
            wx.showToast({
                title: '请设置活动密码',
                icon: 'none'
            });
            return;
        }

        this.setData({ submitting: true });

        // 构建活动数据
        const activityData = {
            title: this.data.formData.title,
            startTime: this.data.formData.startTime,
            endTime: this.data.formData.endTime,
            password: this.data.formData.password,
            buildingInfo: {
                buildingNumber: this.data.formData.buildingNumber,
                unitCount: this.data.formData.unitCount,
                floorCount: this.data.formData.floorCount,
                houseTypes: this.data.formData.houseTypes.filter(type => type.selected).map(type => type.name)
            },
            rooms: this.data.generatedRooms
        };

        // 模拟API请求
        setTimeout(() => {
            this.setData({ submitting: false });

            wx.showToast({
                title: '创建成功',
                icon: 'success'
            });

            // 跳转到活动列表页
            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/activity/list/list'
                });
            }, 1500);
        }, 2000);

        // 实际API请求代码（暂时注释）
        /*
        activityService.createActivity(activityData)
          .then(res => {
            this.setData({ submitting: false });
            
            if (res.code === 200) {
              wx.showToast({
                title: '创建成功',
                icon: 'success'
              });
              
              // 跳转到活动列表页
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/activity/list/list'
                });
              }, 1500);
            } else {
              wx.showModal({
                title: '创建失败',
                content: res.message || '创建活动失败，请重试',
                showCancel: false
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 创建活动失败', err);
            this.setData({ submitting: false });
            
            wx.showModal({
              title: '创建失败',
              content: '网络错误，请重试',
              showCancel: false
            });
          });
        */
    }
}); 