const app = getApp();
const config = require('../../../config');
const request = require('../../../utils/request');
const activityService = require('../../../services/activity-service');

Page({
    data: {
        loading: true,
        submitting: false,
        activityId: '',
        password: '',
        activity: null,
        buildings: [],
        selectedBuilding: '',
        floors: [],
        selectedFloor: '',
        rooms: [],
        selectedRooms: [],
        grabSuccess: false,
        grabResult: null,
        errorMsg: '',
        phoneNumber: ''
    },

    onLoad: function (options) {
        if (options.id) {
            this.setData({
                activityId: options.id
            });

            // 获取本地存储的手机号
            const phoneNumber = wx.getStorageSync('phoneNumber');
            if (phoneNumber) {
                this.setData({ phoneNumber });
            }

            // 加载活动信息
            this.loadActivityInfo();
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

    // 加载活动信息
    loadActivityInfo: function () {
        this.setData({ loading: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟活动数据
            const activityData = {
                id: this.data.activityId,
                title: '某小区1号楼房源抢购活动',
                startTime: '2023-11-10 09:00',
                endTime: '2023-11-15 18:00',
                status: 'active',
                buildings: ['1号楼', '2号楼', '3号楼']
            };

            this.setData({
                loading: false,
                activity: activityData,
                buildings: activityData.buildings
            });
        }, 1000);

        // 实际API请求代码（暂时注释）
        /*
        activityService.getActivityDetail(this.data.activityId)
          .then(res => {
            if (res.code === 200) {
              this.setData({
                loading: false,
                activity: res.data,
                buildings: res.data.buildings || []
              });
            } else {
              this.setData({
                loading: false,
                errorMsg: res.message || '获取活动信息失败'
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 获取活动信息失败', err);
            this.setData({
              loading: false,
              errorMsg: '网络错误，请重试'
            });
          });
        */
    },

    // 输入框内容变化处理
    onInputChange: function (e) {
        const { field } = e.currentTarget.dataset;
        const { value } = e.detail;

        this.setData({
            [field]: value
        });
    },

    // 验证密码
    verifyPassword: function () {
        if (!this.data.password.trim()) {
            wx.showToast({
                title: '请输入抢房密码',
                icon: 'none'
            });
            return;
        }

        this.setData({ submitting: true });

        // 模拟API请求
        setTimeout(() => {
            this.setData({
                submitting: false,
                // 假设密码验证成功
                selectedBuilding: this.data.buildings[0]
            });

            // 加载楼层信息
            this.loadFloors();
        }, 1000);

        // 实际API请求代码（暂时注释）
        /*
        activityService.verifyActivityPassword({
          activityId: this.data.activityId,
          password: this.data.password,
          phoneNumber: this.data.phoneNumber
        })
          .then(res => {
            this.setData({ submitting: false });
            
            if (res.code === 200) {
              // 密码验证成功，设置默认选中的楼栋
              if (this.data.buildings.length > 0) {
                this.setData({
                  selectedBuilding: this.data.buildings[0]
                });
                
                // 加载楼层信息
                this.loadFloors();
              }
            } else {
              wx.showModal({
                title: '验证失败',
                content: res.message || '密码验证失败，请重试',
                showCancel: false
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 密码验证失败', err);
            this.setData({ submitting: false });
            
            wx.showModal({
              title: '验证失败',
              content: '网络错误，请重试',
              showCancel: false
            });
          });
        */
    },

    // 选择楼栋
    selectBuilding: function (e) {
        const building = e.currentTarget.dataset.building;

        this.setData({
            selectedBuilding: building,
            selectedFloor: '',
            floors: [],
            rooms: [],
            selectedRooms: []
        });

        // 加载楼层信息
        this.loadFloors();
    },

    // 加载楼层信息
    loadFloors: function () {
        if (!this.data.selectedBuilding) {
            return;
        }

        this.setData({ loading: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟楼层数据
            const floorsData = ['1层', '2层', '3层', '4层', '5层', '6层'];

            this.setData({
                loading: false,
                floors: floorsData,
                selectedFloor: floorsData[0]
            });

            // 加载房间信息
            this.loadRooms();
        }, 800);

        // 实际API请求代码（暂时注释）
        /*
        activityService.getFloors({
          activityId: this.data.activityId,
          buildingNumber: this.data.selectedBuilding
        })
          .then(res => {
            if (res.code === 200) {
              const floors = res.data || [];
              
              this.setData({
                loading: false,
                floors: floors,
                selectedFloor: floors.length > 0 ? floors[0] : ''
              });
              
              // 如果有楼层，加载房间信息
              if (floors.length > 0) {
                this.loadRooms();
              }
            } else {
              this.setData({
                loading: false,
                errorMsg: res.message || '获取楼层信息失败'
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 获取楼层信息失败', err);
            this.setData({
              loading: false,
              errorMsg: '网络错误，请重试'
            });
          });
        */
    },

    // 选择楼层
    selectFloor: function (e) {
        const floor = e.currentTarget.dataset.floor;

        this.setData({
            selectedFloor: floor,
            rooms: [],
            selectedRooms: []
        });

        // 加载房间信息
        this.loadRooms();
    },

    // 加载房间信息
    loadRooms: function () {
        if (!this.data.selectedBuilding || !this.data.selectedFloor) {
            return;
        }

        this.setData({ loading: true });

        // 模拟API请求
        setTimeout(() => {
            // 模拟房间数据
            const roomsData = [
                { id: '101', number: '101', type: '01户型', area: '89㎡', price: '120万', status: 'available' },
                { id: '102', number: '102', type: '02户型', area: '110㎡', price: '150万', status: 'available' },
                { id: '103', number: '103', type: '01户型', area: '89㎡', price: '118万', status: 'sold' },
                { id: '104', number: '104', type: '03户型', area: '130㎡', price: '180万', status: 'available' }
            ];

            this.setData({
                loading: false,
                rooms: roomsData
            });
        }, 800);

        // 实际API请求代码（暂时注释）
        /*
        activityService.getRooms({
          activityId: this.data.activityId,
          buildingNumber: this.data.selectedBuilding,
          floorNumber: this.data.selectedFloor
        })
          .then(res => {
            if (res.code === 200) {
              this.setData({
                loading: false,
                rooms: res.data || []
              });
            } else {
              this.setData({
                loading: false,
                errorMsg: res.message || '获取房间信息失败'
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 获取房间信息失败', err);
            this.setData({
              loading: false,
              errorMsg: '网络错误，请重试'
            });
          });
        */
    },

    // 选择/取消选择房间
    toggleRoomSelection: function (e) {
        const roomId = e.currentTarget.dataset.id;
        const room = this.data.rooms.find(r => r.id === roomId);

        if (!room || room.status !== 'available') {
            return;
        }

        const selectedRooms = [...this.data.selectedRooms];
        const index = selectedRooms.findIndex(r => r.id === roomId);

        if (index === -1) {
            // 添加到已选房间
            selectedRooms.push(room);
        } else {
            // 从已选房间中移除
            selectedRooms.splice(index, 1);
        }

        this.setData({
            selectedRooms: selectedRooms
        });
    },

    // 提交抢房
    submitGrab: function () {
        if (this.data.selectedRooms.length === 0) {
            wx.showToast({
                title: '请至少选择一个房间',
                icon: 'none'
            });
            return;
        }

        wx.showModal({
            title: '确认抢房',
            content: `您已选择 ${this.data.selectedRooms.length} 个房间，确认提交抢房请求吗？`,
            success: (res) => {
                if (res.confirm) {
                    this.doGrabRooms();
                }
            }
        });
    },

    // 执行抢房操作
    doGrabRooms: function () {
        this.setData({ submitting: true });

        const roomIds = this.data.selectedRooms.map(room => room.id);

        // 模拟API请求
        setTimeout(() => {
            // 模拟抢房结果
            const result = {
                success: true,
                message: '抢房成功',
                rooms: this.data.selectedRooms.map(room => ({
                    ...room,
                    grabTime: new Date().toLocaleString()
                }))
            };

            this.setData({
                submitting: false,
                grabSuccess: result.success,
                grabResult: result
            });
        }, 2000);

        // 实际API请求代码（暂时注释）
        /*
        activityService.batchGrabRooms({
          activityId: this.data.activityId,
          roomIds: roomIds,
          phoneNumber: this.data.phoneNumber,
          password: this.data.password
        })
          .then(res => {
            this.setData({ submitting: false });
            
            if (res.code === 200) {
              this.setData({
                grabSuccess: true,
                grabResult: res.data
              });
            } else {
              this.setData({
                grabSuccess: false,
                grabResult: {
                  success: false,
                  message: res.message || '抢房失败，请重试'
                }
              });
            }
          })
          .catch(err => {
            console.error('[ERROR] 抢房失败', err);
            this.setData({
              submitting: false,
              grabSuccess: false,
              grabResult: {
                success: false,
                message: '网络错误，请重试'
              }
            });
          });
        */
    },

    // 返回活动列表
    backToList: function () {
        wx.redirectTo({
            url: '/pages/activity/list/list'
        });
    },

    // 查看我的抢房记录
    viewMyRecords: function () {
        wx.navigateTo({
            url: `/pages/activity/records/records?id=${this.data.activityId}`
        });
    }
}); 