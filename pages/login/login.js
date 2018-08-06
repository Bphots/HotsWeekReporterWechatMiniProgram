// pages/login/login.js
const app = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')
Page({
  data: {
    //服务器相关数据
    regionIndex: 0,
    region: [],
    regionId: [],
    //昵称
    nickName: '',
    //服务器地区
    regionName: '',
    //订阅
    subscription: false,
    //周报按钮
    firstTime: null,
    //开放周报
    open: false,
    //切换所用的角色姓名
    players: [],
    playersIndex: 0,
    //微信授权
    auth: null
  },
  onLoad: function(options) {
    var that = this;
    this.setData({
      region: util.regionInfo('region'),
      regionId: util.regionInfo('regionId')
    })
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          //未授权          
          that.setData({
            auth: false
          })
        } else {
          that.setData({
            auth: true
          })
          that.wxUserLogin()
        }
      }
    })

    var temp = getReportDate()
    if (!temp) {
      this.setData({
        firstTime: '周报暂未开放',
        open: false
      })
    } else {
      this.setData({
        firstTime: '查看周报 ' + temp,
        open: true
      })
    }
  },
  onShow: function(e) {
    var that = this
    that.setLocalPlayers()
    that.setMainPlayerInfo()
  },
  //微信授权
  wxAuth: function(e) {
    console.log('wxAuth');
    var that = this
    this.wxUserLogin()
    this.setData({
      auth: true
    })
  },
  //微信登录
  wxUserLogin: function() {
    var that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code;
        wx.getUserInfo({
          //得到rawData, signatrue, encryptData
          success: function(data) {
            var rawData = data.rawData;
            var signature = data.signature;
            var encryptedData = data.encryptedData;
            var iv = data.iv;
            wx.showLoading({
              title: '请稍候...',
            })
            //获取sessionId等信息
            wx.request({
              url: config.service.loginUrl,
              data: {
                "code": code,
                "rawData": rawData,
                "signature": signature,
                'iv': iv,
                'encryptedData': encryptedData
              },
              method: 'GET',
              success: function(info) {
                app.globalData.sessionId = info.data.data.sessionid
                that.getPlayerInfo()
              },
              fail: function(e) {
                console.log(e);
              },
              complete: function() {
                wx.hideLoading()
              }
            })
          },
          fail: function(data) {
            console.log(data);
          }
        })
      }
    })
  },
  //获取已绑定的角色
  getPlayerInfo: function() {
    console.log('getPlayerInfo')
    wx.showLoading({
      title: '请稍候...',
    })
    var that = this
    //获取已绑定用户信息
    wx.request({
      url: config.service.reportUrl,
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'GET',
      success: function(info) {
        if (info.data.result != null && info.data.result == 'Success') {
          var playersInfo = info.data.data
          app.globalData.playersInfo = playersInfo
          if (playersInfo != null && playersInfo.length > 0) {
            that.setData({
              subscription: true,
            })
            //查询持久化保存的PlayerId
            var playerId = wx.getStorageSync('playerId')
            app.globalData.playerInfo = util.getLocalPlayerInfo(playerId)
            //如果没有记录则将第一个当做默认角色，并保存PlayerId
            if (app.globalData.playerInfo == null) {
              app.globalData.playerInfo = playersInfo[0]
              wx.setStorageSync('playerId', app.globalData.playerInfo.PlayerId)
            }
            that.setMainPlayerInfo()
            that.setLocalPlayers()
            that.getGlobalInfo()
          } else {
            //没有角色
            that.setData({
              subscription: false,
            })
          }
        } else {
          var msg
          if (info.data.msg == null) {
            msg = '获取失败'
          } else {
            msg = info.data.msg
          }
          wx.showToast({
            title: msg,
            icon: 'none'
          })
        }
      },
      fail: function(e) {
        console.log(e)
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },
  //设置页面数据
  setMainPlayerInfo: function() {
    console.log('setMainPlayerInfo')
    var that = this
    var playerInfo = app.globalData.playerInfo
    var playersInfo = app.globalData.playersInfo
    if (playerInfo != null && playersInfo != null) {
      var nickName = playerInfo.Name + '#' + playerInfo.BattleTag
      var region = playerInfo.BattleNetRegionId
      this.setData({
        subscription: true,
        nickName: nickName,
        regionName: util.getRegionName(region),
      })
      this.data.playersIndex = 0
      for (var i in playersInfo) {
        var p = playersInfo[i]
        if (p.PlayerId == playerInfo.PlayerId) {
          this.setData({
            playersIndex: i
          })
          break
        }
      }
    }
  },
  //查询全球数据
  getGlobalInfo: function() {
    var that = this
    var playerInfo = app.globalData.playerInfo
    wx.request({
      url: config.service.globalUrl + playerInfo.LastWeekNumber,
      method: 'GET',
      success: function(info) {
        app.globalData.dataGlobal = util.parseFields(info.data)
      },
      fail: function(e) {
        console.log(e);
      }
    })
  },
  //主页角色切换
  setLocalPlayers: function() {
    console.log('setLocalPlayers')
    var p = []
    var playersInfo = app.globalData.playersInfo
    if (playersInfo != null && playersInfo.length > 0) {
      for (var i in playersInfo) {
        p.push(playersInfo[i].Name + "#" + playersInfo[i].BattleTag)
      }
    } else {
      //无角色
      this.setData({
        subscription: false
      })
    }
    this.setData({
      players: p
    })
  },
  //服务器选择
  bindRegionChange: function(e) {
    this.setData({
      regionIndex: e.detail.value
    })
  },
  //角色切换
  bindPlayerChange: function(e) {
    var index = e.detail.value
    this.setData({
      playersIndex: index
    })
    app.globalData.playerInfo = app.globalData.playersInfo[index]
    wx.setStorageSync("playerId", app.globalData.playerInfo.PlayerId)
    this.setData({
      nickName: app.globalData.playerInfo.Name + '#' + app.globalData.playerInfo.BattleTag,
      regionName: util.getRegionName(app.globalData.playerInfo.BattleNetRegionId)
    })
  },

  formSubmit: function(e) {
    var that = this
    wx.showLoading({
      title: '请稍候...',
    })
    if (e.detail.value.name != "") {
      console.log('订阅')
      wx.request({
        url: config.service.subscribe,
        data: {
          "name": e.detail.value.name,
          'region': this.data.regionId[this.data.regionIndex],
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
            if (info.data.result != null && info.data.result == 'Success') {
              that.getPlayerInfo()
              var reg = util.getRegionName(info.data.data.region)
              that.setData({
                nickName: info.data.data.name,
                regionName: reg,
                subscription: true
              })
              wx.showToast({
                title: '订阅成功',
                icon: 'none'
              })
            } else {
              var msg
              if (info.data.msg == null) {
                msg = '订阅失败'
              } else {
                msg = info.data.msg
              }
              wx.showToast({
                title: msg,
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
  cancel: function(e) {
    var that = this
    console.log('取消订阅')
    wx.showLoading({
      title: '请稍候...',
    })
    var playerInfo = app.globalData.playerInfo
    wx.request({
      url: config.service.subscribe,
      data: {
        "name": playerInfo.Name + '#' + playerInfo.BattleTag,
        'region': playerInfo.BattleNetRegionId,
        'cancel': 1
      },
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'POST',
      success: function(info) {
        if (info.data.result != null && info.data.result == 'Success') {
          wx.showToast({
            title: '取消成功',
            icon: 'none'
          })
          //移除取消订阅角色
          util.deletePlayers(app.globalData.playerInfo.PlayerId)
          if (app.globalData.playersInfo != null && app.globalData.playersInfo.length > 0) {
            //还有其他订阅角色
            app.globalData.playerInfo = app.globalData.playersInfo[0]
            wx.setStorageSync('playerId', app.globalData.playerInfo.PlayerId)
            that.setMainPlayerInfo()
          } else {
            //无订阅角色
            that.setData({
              nickName: '',
              regionName: '',
              subscription: false
            })
          }
        } else {
          var msg
          if (info.data.msg == null) {
            msg = '取消失败'
          } else {
            msg = info.data.msg
          }
          wx.showToast({
            title: msg,
            icon: 'none'
          })
        }
      },
      fail: function(e) {
        console.log(e)
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },
  week: function() {
    if (this.data.open) {
      wx.showLoading()
      wx.navigateTo({
        url: '../weekReport/weekReport',
      })
    }
  },
})

function getReportDate() {
  var HotsweekStartTime = 1531612800000
  var oneWeek = 7 * 86400000
  var oneHour = 3600000
  var firstReportTime = HotsweekStartTime + oneWeek + 9 * oneHour
  var now = new Date().getTime()
  // if (now < firstReportTime) return false
  var time = firstReportTime
  while (time + oneWeek < now) {
    time += oneWeek
  }
  var res = new Date(time)
  var year = res.getFullYear()
  var month = res.getMonth() + 1
  var day = res.getDate()
  var date = year + '.' + month + '.' + day
  return date
}