// 引入API工具
const api = require('../../utils/api');

Page({
  data: {
    activityId: null,
    password: '',
    roomList: [],
    selectedRooms: [],
    loading: true,
    error: null,
    phoneNumber: '',
    showPhoneDialog: false,
    unitFilter: 'all',
    floorFilter: 'all',
    typeFilter: 'all',
    statusFilter: 'available',
    filteredRooms: []
  },

  onLoad: function(options) {
    if (options.id && options.password) {
      this.setData({
        activityId: options.id,
        password: options.password
      });
      this.fetchRoomList(options.id);
    } else {
      this.setData({
        error: '参数错误',
        loading: false
      });
    }
  },

  /**
   * 获取房间列表
   */
  fetchRoomList: function(activityId) {
    this.setData({
      loading: true,
      error: null
    });

    api.getRoomList(activityId)
      .then(res => {
        if (res.code === 0) {
          const roomList = res.data || [];
          
          // 提取所有单元、楼层和户型
          const units = [...new Set(roomList.map(room => room.unit))];
          const floors = [...new Set(roomList.map(room => room.floor))];
          const types = [...new Set(roomList.map(room => room.houseType))];
          
          this.setData({
            roomList,
            units,
            floors,
            types,
            loading: false
          });
          
          this.filterRooms();
        } else {
          this.setData({
            error: res.message || '获取房间列表失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取房间列表失败', err);
        this.setData({
          error: '网络错误，请稍后重试',
          loading: false
        });
      });
  },

  /**
   * 筛选房间
   */
  filterRooms: function() {
    const { roomList, unitFilter, floorFilter, typeFilter, statusFilter } = this.data;
    
    let filteredRooms = roomList;
    
    // 筛选单元
    if (unitFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.unit == unitFilter);
    }
    
    // 筛选楼层
    if (floorFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.floor == floorFilter);
    }
    
    // 筛选户型
    if (typeFilter !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.houseType === typeFilter);
    }
    
    // 筛选状态
    if (statusFilter === 'available') {
      filteredRooms = filteredRooms.filter(room => room.status === 0);
    } else if (statusFilter === 'grabbed') {
      filteredRooms = filteredRooms.filter(room => room.status === 1);
    }
    
    this.setData({
      filteredRooms
    });
  },

  /**
   * 切换单元筛选
   */
  changeUnitFilter: function(e) {
    this.setData({
      unitFilter: e.currentTarget.dataset.value
    });
    this.filterRooms();
  },

  /**
   * 切换楼层筛选
   */
  changeFloorFilter: function(e) {
    this.setData({
      floorFilter: e.currentTarget.dataset.value
    });
    this.filterRooms();
  },

  /**
   * 切换户型筛选
   */
  changeTypeFilter: function(e) {
    this.setData({
      typeFilter: e.currentTarget.dataset.value
    });
    this.filterRooms();
  },

  /**
   * 切换状态筛选
   */
  changeStatusFilter: function(e) {
    this.setData({
      statusFilter: e.currentTarget.dataset.value
    });
    this.filterRooms();
  },

  /**
   * 选择/取消选择房间
   */
  toggleRoomSelection: function(e) {
    const roomId = e.currentTarget.dataset.id;
    const { selectedRooms } = this.data;
    
    const index = selectedRooms.indexOf(roomId);
    if (index === -1) {
      // 选择房间
      this.setData({
        selectedRooms: [...selectedRooms, roomId]
      });
    } else {
      // 取消选择
      const newSelectedRooms = [...selectedRooms];
      newSelectedRooms.splice(index, 1);
      this.setData({
        selectedRooms: newSelectedRooms
      });
    }
  },

  /**
   * 显示手机号输入框
   */
  showPhoneInput: function() {
    const { selectedRooms } = this.data;
    
    if (selectedRooms.length === 0) {
      wx.showToast({
        title: '请选择至少一个房间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showPhoneDialog: true
    });
  },

  /**
   * 关闭手机号输入框
   */
  closePhoneInput: function() {
    this.setData({
      showPhoneDialog: false,
      phoneNumber: ''
    });
  },

  /**
   * 手机号输入事件
   */
  onPhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  /**
   * 提交抢房请求
   */
  submitGrab: function() {
    const { activityId, password, selectedRooms, phoneNumber } = this.data;
    
    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '提交中...'
    });
    
    api.grabRooms(activityId, selectedRooms, phoneNumber, password)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0) {
          wx.showToast({
            title: '抢房成功',
            icon: 'success'
          });
          
          // 关闭弹窗
          this.setData({
            showPhoneDialog: false,
            phoneNumber: '',
            selectedRooms: []
          });
          
          // 刷新房间列表
          this.fetchRoomList(activityId);
        } else {
          wx.showToast({
            title: res.message || '抢房失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('抢房失败', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      });
  }
});
