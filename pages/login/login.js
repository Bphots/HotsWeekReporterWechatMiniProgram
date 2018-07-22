// pages/login/login.js
const app = getApp()
const util = require('../../utils/util.js')

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
    subscription: null,
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
                success: function (data) {
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
                    success: function (info) {
                      app.globalData.sessionId = info.data.data.sessionid
                      that.getPlayerInfo()
                    },
                    fail: function (e) {
                      console.log(e);
                    }
                  })
                },
                fail: function (data) {
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

    // wx.getStorage({
    //   key: 'nickName',
    //   success: function(res) {
    //     if (res.data) {
    //       that.setData({
    //         nickName: res.data,
    //         subscription: true
    //       })
    //     }
    //   },
    // })
    // wx.getStorage({
    //   key: 'region',
    //   success: function(res) {
    //     var reg
    //     switch (res.data) {
    //       case 1:
    //         reg = '(美服)'
    //         break;
    //       case 2:
    //         reg = '(欧服)'
    //         break;
    //       case 3:
    //         reg = '(亚服)'
    //         break;
    //       case 5:
    //         reg = ''
    //         break;
    //       default:
    //         reg = '(未知)'
    //         break;
    //     }
    //     that.data.regionName = reg
    //     console.log(reg)
    //     that.setData({
    //       regionName: reg
    //     })
    //   },
    // })

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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindRegionChange: function(e) {
    this.setData({
      regionIndex: e.detail.value
    })
  },
  wxAuth: function (e) {
    wx.showLoading({
      title: '请稍候...',
    })
    var that = this
    console.log(this.subscription);
    if (this.subscription != true)
    {
      console.log(app.globalData.sessionId);
      if (app.globalData.sessionId == null) {
        console.log('login');
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            var code = res.code; //获取code
            wx.getUserInfo({ //得到rawData, signatrue, encryptData
              success: function (data) {
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
                  success: function (info) {
                    app.globalData.sessionId = info.data.data.sessionid
                    that.getPlayerInfo()
                    wx.hideLoading()
                  },
                  fail: function (e) {
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
              fail: function (data) {
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
      }
      else
      {
        wx.hideLoading()
        this.getPlayerInfo()
      }
    }
    this.setData({
    auth: true
    })
    wx.hideLoading()
  },
  getPlayerInfo: function () {
    var that = this
    console.log(app.globalData.sessionId)
    wx.request({
      url: 'https://www.bphots.com/wxmini/api/reporter/info',
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'GET',
      success: function (info) {
        if (info.data.data != null) {
          console.log(info.data.data)
          app.globalData.playerId = info.data.data.PlayerId
          app.globalData.lastWeekNumber = info.data.data.LastWeekNumber
          wx.request({
            url: 'https://www.bphots.com/week/api/report/global/' + app.globalData.lastWeekNumber,
            method: 'GET',
            success: function (info) {
              app.globalData.dataGlobal = util.parseFields(info.data)
              that.setData({
                auth: true,
                subscription: true,
              })
            },
            fail: function (e) {
              console.log(e);
            }
          })
          var nickName = info.data.data.Name + '#' + info.data.data.BattleTag
          var region = info.data.data.BattleNetRegionId
          that.setData({
            subscription: true,
            nickName: nickName,
            regionName: that.getRegionName(region),
          })
          wx.setStorage({
            key: 'nickName',
            data: nickName,
          })
          wx.setStorage({
            key: 'region',
            data: region,
          })

          // that.onLoad()
        } else {
          that.setData({
            auth: true,
            subscription: false,
          })
          console.log(info)
        }
      },
      fail: function (e) { }
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
        url: 'https://www.bphots.com/wxmini/api/reporter/subscribe',
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
              var reg = that.getRegionName(info.data.data.region)
              that.setData({
                nickName: info.data.data.name,
                regionName: reg,
                subscription: true
              })

              wx.setStorage({
                key: 'nickName',
                data: info.data.data.name,
              })
              wx.setStorage({
                key: 'region',
                data: info.data.data.region,
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
  getRegionName: function (regionID) {
    var reg
    switch (regionID) {
      case 1:
        reg = '(美服)'
        break;
      case 2:
        reg = '(欧服)'
        break;
      case 3:
        reg = '(亚服)'
        break;
      case 5:
        reg = ''
        break;
      default:
        reg = '(未知)'
        break;
    }
    return reg
  },
  cancel: function(e) {
    var that = this
    console.log('取消订阅')
    wx.request({
      url: 'https://www.bphots.com/wxmini/api/reporter/subscribe',
      data: {
        "name": ''
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
            that.setData({
              nickName: '',
              regionName: '',
              subscription: false
            })
            wx.showToast({
              title: '取消成功',
              icon: 'none'
            })
            wx.removeStorage({
              key: 'nickName',
              success: function(res) {},
            })
            wx.removeStorage({
              key: 'region',
              success: function(res) {},
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
  },
  week: function() {
    if (this.data.open) {
      wx.navigateTo({
        url: '../index/index',
      })
    }
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