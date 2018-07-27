// pages/login/login.js
const app = getApp()
const util = require('../../utils/util.js')
const config = require('../../config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowH: 0,
    regionIndex: 0,
    region: ['国服', '美服', '亚服', '欧服'],
    regionId: [5, 1, 3, 2],
    //昵称
    nickName: '',
    //服务器地区
    regionName: '',
    //订阅
    subscription: false,
    //周报按钮
    firstTime: null,
    // 开放周报
    open: false,
    auth: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          // 登录
          that.setData({
            auth: false
          })
          app.login(that)
        } else {
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              var code = res.code; //获取code
              wx.getUserInfo({ //得到rawData, signatrue, encryptData
                success: function(data) {
                  var rawData = data.rawData;
                  var signature = data.signature;
                  var encryptedData = data.encryptedData;
                  var iv = data.iv;
                  wx.request({
                    url: 'https://www.bphots.com/wxmini/api/login',
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
                    }
                  })
                },
                fail: function(data) {
                  console.log(data);
                }

              })
            }
          })
        }
      }
    })
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowH: res.windowHeight
        });
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
    //重复打开时显示主页角色
    wx.getStorage({
      key: 'playerId',
      success: function(res) {
        if (app.globalData.playerInfo != null) {
          var nickName = app.globalData.playerInfo.Name + '#' + app.globalData.playerInfo.BattleTag
          var region = app.globalData.playerInfo.BattleNetRegionId
          that.setData({
            nickName: nickName,
            regionName: util.getRegionName(region),
          })
        } else {
          that.setData({
            subscription: false
          })
        }
      },
      fail: function(res) {
        that.setData({
          subscription: false
        })
      }
    })
  },
  //服务器选择
  bindRegionChange: function(e) {
    this.setData({
      regionIndex: e.detail.value
    })
  },
  //微信授权
  wxAuth: function(e) {
    wx.showLoading({
      title: '请稍候...',
    })
    var that = this
    if (this.subscription != true) {
      if (app.globalData.sessionId == null) {
        console.log('wxAuth');
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            var code = res.code; //获取code
            wx.getUserInfo({ //得到rawData, signatrue, encryptData
              success: function(data) {
                var rawData = data.rawData;
                var signature = data.signature;
                var encryptedData = data.encryptedData;
                var iv = data.iv;
                //用户登录
                wx.request({
                  url: config.service.login,
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
                    that.setData({
                      auth: true,
                    })
                    that.getPlayerInfo()
                    wx.hideLoading()
                  },
                  fail: function(e) {
                    wx.hideLoading()
                    wx.showModal({
                      title: '错误',
                      content: '网路超时，请重新尝试',
                      showCancel: false,
                    })
                    console.log(e);
                  }
                })
              },
              fail: function(data) {
                wx.hideLoading()
                wx.showModal({
                  title: '错误',
                  content: '微信授权失败',
                  showCancel: false,
                })
                console.log(data);
              }
            })
          }
        })
      } else {
        wx.hideLoading()
        that.setData({
          auth: true,
        })
        this.getPlayerInfo()
      }
    }
    this.setData({
      auth: true
    })
    wx.hideLoading()
  },
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
          that.setData({
            auth: true,
          })
          app.globalData.playersInfo = info.data.data
          if (info.data.data != null && info.data.data.length > 0) {
            that.setData({
              subscription: true,
              auth: true,
            })
            //查询持久化保存的PlayerId
            wx.getStorage({
              key: 'playerId',
              success: function(res) {
                for (var i in info.data.data) {
                  var playInfo = info.data.data[i]
                  if (playInfo.PlayerId == res.data) {
                    app.globalData.playerInfo = playInfo
                    break
                  }
                }
                //如果没有记录则将第一个当做默认角色，并保存PlayerId
                if (app.globalData.playerInfo == null) {
                  app.globalData.playerInfo = info.data.data[0]
                  wx.setStorage({
                    key: 'playerId',
                    data: app.globalData.playerInfo.PlayerId,
                  })
                }
                that.setPlayerInfo()
              },
              fail: function(res) {
                // 无playerId
                app.globalData.playerInfo = info.data.data[0]
                wx.setStorage({
                  key: 'playerId',
                  data: app.globalData.playerInfo.PlayerId,
                })
                that.setPlayerInfo()
              }
            })
          } else {

          }

        } else {
          that.setData({
            auth: true,
            subscription: false,
          })
          console.log(info)
        }
      },
      fail: function(e) {}
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
            if (info.data.result == 'Success') {
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
  cancel: function(e) {
    var that = this
    console.log('取消订阅')
    wx.request({
      url: config.service.subscribe,
      data: {
        "name": app.globalData.playerInfo.Name + '#' + app.globalData.playerInfo.BattleTag,
        'region': app.globalData.playerInfo.BattleNetRegionId,
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
            for (var i in app.globalData.playersInfo) {
              var playInfo = app.globalData.playersInfo[i]
              if (playInfo.PlayerId == app.globalData.playerInfo.PlayerId) {
                app.globalData.playersInfo.splice(i, 1)
                break
              }
            }
            if (app.globalData.playersInfo != null && app.globalData.playersInfo.length > 0) {
              //还有其他订阅角色
              app.globalData.playerInfo = info.data.data[0]
              wx.setStorage({
                key: 'playerId',
                data: app.globalData.playerInfo.PlayerId,
              })
              that.setPlayerInfo()
            } else {
              //无订阅角色
              that.setData({
                nickName: '',
                regionName: '',
                subscription: false
              })
            }
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
  },
  week: function() {
    if (this.data.open) {
      wx.showLoading()
      wx.navigateTo({
        url: '../index/index',
      })
    }
  },
  //设置页面数据
  setPlayerInfo: function() {
    console.log(app.globalData.playerInfo)
    var that = this
    var nickName = app.globalData.playerInfo.Name + '#' + app.globalData.playerInfo.BattleTag
    var region = app.globalData.playerInfo.BattleNetRegionId
    this.setData({
      subscription: true,
      nickName: nickName,
      regionName: util.getRegionName(region),
    })

    //查询全球数据
    wx.request({
      url: config.service.globalUrl + app.globalData.playerInfo.LastWeekNumber,
      method: 'GET',
      success: function(info) {
        app.globalData.dataGlobal = util.parseFields(info.data)
        that.setData({
          auth: true,
        })
      },
      fail: function(e) {
        console.log(e);
      }
    })
  }
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