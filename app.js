//app.js
App({
  onLaunch: function() {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
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
                that.globalData.sessionId = info.data.data.sessionid
                getPlayerInfo(); // 这个方法调用接口获取玩家名，无需传参
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
    //获取映射
    wx.request({
      url: 'https://www.bphots.com/week/api/report/presets',
      method: 'GET',
      success: function(info) {
        that.globalData.presets = info.data
      },
      fail: function(e) {
        console.log(e);
      }
    })
  },
  globalData: {
    userInfo: null,
    sessionId: null,
    //用户ID
    playerId: null,
    //周ID
    lastWeekNumber: null,
    //映射数据
    presets: null
  }
})

function getPlayerInfo() {
  var that = getApp();
  wx.request({
    url: 'https://www.bphots.com/wxmini/api/reporter/info',
    header: {
      'sessionid': that.globalData.sessionId
    },
    method: 'GET',
    success: function(info) {
      that.globalData.playerId = info.data.data.PlayerId
      that.globalData.lastWeekNumber = info.data.data.LastWeekNumber
    },
    fail: function(e) {}
  })
}