//app.js
const util = require('utils/util.js')
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

    getPresets(that)
    getHeroInfo(that)    
  },
  globalData: {
    userInfo: null,
    sessionId: null,
    //用户ID
    playerId: null,
    //周ID
    lastWeekNumber: null,
    //映射数据
    presets: null,
    //英雄数据
    heroes: null,
    //用户各种数据
    // dataPersonal: null,
    //全球数据
    dataGlobal: null
  }
})
//获取用户信息
function getPlayerInfo() {
  var that = getApp();
  wx.request({
    url: 'https://www.bphots.com/wxmini/api/reporter/info',
    header: {
      'sessionid': that.globalData.sessionId
    },
    method: 'GET',
    success: function(info) {
      if (info.data.data != null) {
        that.globalData.playerId = info.data.data.PlayerId
        that.globalData.lastWeekNumber = info.data.data.LastWeekNumber
        getGlobaldata(that)
      }
    },
    fail: function(e) {}
  })
}
//获取映射
function getPresets(that) {
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
}
//获取英雄信息
function getHeroInfo(that) {
  wx.request({
    url: 'https://www.bphots.com/bp_helper/get/herolist/v2/',
    method: 'GET',
    success: function(info) {
      that.globalData.heroes = info.data
    },
    fail: function(e) {
      console.log(e);
    }
  })
}
//全球数据
function getGlobaldata(that) {
  wx.request({
    url: 'https://www.bphots.com/week/api/report/global/' + that.globalData.lastWeekNumber,
    method: 'GET',
    success: function(info) {      
      that.globalData.dataGlobal = util.parseFields(info.data)
    },
    fail: function(e) {
      console.log(e);
    }
  })
}