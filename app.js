//app.js
const config = require('config.js')
App({
  onLaunch: function() {
    var that = this;
    getPresets(that)
    getHeroInfo(that)
  },
  globalData: {
    sessionId: null,
    // 已订阅的角色
    playersInfo: null,
    //当前显示的用户
    playerInfo:null,    
    //映射数据
    presets: null,
    //英雄数据
    heroes: null,
    //全球数据
    dataGlobal: null,
  },
})
//获取映射
function getPresets(that) {
  wx.request({
    url:config.service.presetsUrl,
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
    url:config.service.heroListUrl,
    method: 'GET',
    success: function(info) {
      that.globalData.heroes = info.data
    },
    fail: function(e) {
      console.log(e);
    }
  })
}