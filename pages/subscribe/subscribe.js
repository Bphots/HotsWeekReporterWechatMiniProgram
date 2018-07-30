// pages/subscribe/subscribe.js
const app = getApp()
const config = require('../../config.js')
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowH: 0,
    //已订阅角色
    players: [],
    showModal: false,
    regionIndex: 0,
    region: ['国服', '美服', '亚服', '欧服'],
    regionId: [5, 1, 3, 2],
    playerName: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowH: res.windowHeight
        });
      }
    })
    this.setPlayerInfo()
  },
  setPlayerInfo: function() {
    var players = []
    for (var i in app.globalData.playersInfo) {
      var player = app.globalData.playersInfo[i]
      player.regionName = util.getRegionName(player.BattleNetRegionId)
      if (player.PlayerId == app.globalData.playerInfo.PlayerId) {
        player.isMain = true
      } else {
        player.isMain = false
      }
      players.push(player)
    }
    this.setData({
      players: players
    })
  },
  setMain: function(e) {
    var playerInfo = util.getLocalPlayerInfo(e.currentTarget.dataset.playerid)
    app.globalData.playerInfo = playerInfo
    this.setPlayerInfo()
    wx.setStorageSync('playerId', playerInfo.PlayerId)
    wx.showToast({
      title: '修改成功',
      icon: 'none'
    })
  },
  add: function() {
    if (app.globalData.playersInfo.length >= 5) {
      wx.showToast({
        title: '最多绑定5个角色',
        icon: 'none'
      })
    } else {
      this.setData({
        showModal: true
      })
    }
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  /**
   * 订阅
   */
  onConfirm: function() {
    var that = this
    var name = this.data.playerName
    var region = this.data.regionId[this.data.regionIndex]
    wx.showLoading({
      title: '请稍候...',
    })
    if (name != null && name != '') {
      console.log('订阅')
      wx.request({
        url: config.service.subscribe,
        data: {
          "name": name,
          'region': region,
        },
        header: {
          'sessionid': app.globalData.sessionId
        },
        method: 'POST',
        success: function(info) {
          wx.hideLoading()
          var result = info.data.result
          if (info.data.result == null) {
            wx.showToast({
              title: '请输入正确的格式',
              icon: 'none'
            })
          } else {
            if (info.data.result == 'Success') {
              wx.showToast({
                title: '订阅成功',
                icon: 'none'
              })
              that.hideModal();
              that.getPlayerInfo()

            } else {
              wx.showToast({
                title: info.data.msg,
                icon: 'none'
              })
            }
          }
        },
        fail: function(e) {
          wx.hideLoading()
        }
      })
    } else {
      wx.showToast({
        title: '请输入玩家信息',
        icon: 'none'
      })
    }

  },
  //取消订阅
  cancelSubscribe: function(e) {
    wx.showLoading({
      title: '请稍候...',
    })
    var that = this
    console.log('取消订阅')
    var playerInfo = util.getLocalPlayerInfo(e.currentTarget.dataset.playerid)
    var playerId = playerInfo.PlayerId
    var name = playerInfo.Name
    var battleTag = playerInfo.BattleTag
    var regionId = playerInfo.BattleNetRegionId
    wx.request({
      url: config.service.subscribe,
      data: {
        "name": name + '#' + battleTag,
        'region': regionId,
        'cancel': 1
      },
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'POST',
      success: function(info) {
        wx.hideLoading()
        var result = info.data.result
        if (info.data.result == null) {
          wx.showToast({
            title: '取消失败',
            icon: 'none'
          })
        } else {
          if (info.data.result == 'Success') {
            wx.showToast({
              title: '取消成功',
              icon: 'none'
            })
            //移除取消订阅角色
            util.deletePlayers(playerId)
            if (app.globalData.playersInfo != null && app.globalData.playersInfo.length > 0) {
              //还有其他订阅角色
              app.globalData.playerInfo = app.globalData.playersInfo[0]
              wx.setStorageSync('playerId', app.globalData.playerInfo.PlayerId)

            } else {
              //无订阅角色
              app.globalData.playersInfo = null
              wx.removeStorage({
                key: 'playerId',
                success: function(res) {},
              })
            }
            that.setPlayerInfo()
          } else {
            wx.showToast({
              title: info.data.msg,
              icon: 'none'
            })
          }
        }
      },
      fail: function(e) {
        wx.hideLoading()
      },
      complete: function(e) {
        wx.hideLoading()
      }
    })
  },
  //获取用户信息
  getPlayerInfo: function() {
    var that = this
    //获取已绑定用户信息
    wx.request({
      url: config.service.reportUrl,
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'GET',
      success: function(info) {
        if (info.data.data != null) {
          app.globalData.playersInfo = info.data.data
          if (info.data.data != null && info.data.data.length > 0) {
            //查询持久化保存的PlayerId
            var playerId = wx.getStorageSync('playerId')
            app.globalData.playerInfo = util.getLocalPlayerInfo(playerId)
            if (app.globalData.playerInfo == null) {
              app.globalData.playerInfo = info.data.data[0]
              wx.setStorageSync('playerId', app.globalData.playerInfo.PlayerId)
            } else {
               // 无playerId
              app.globalData.playerInfo = info.data.data[0]
              wx.setStorageSync('playerId', app.globalData.playerInfo.PlayerId)
            }
            that.setPlayerInfo()
          }
        } else {}
      },
      fail: function(e) {}
    })
  },
  bindRegionChange: function(e) {
    this.setData({
      regionIndex: e.detail.value
    })
  },
  bindNameInput: function(e) {
    this.data.playerName = e.detail.value
  }
})