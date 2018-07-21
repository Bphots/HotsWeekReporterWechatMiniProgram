//index.js
const app = getApp()
const presetsJs = require('presets.js')
const util = require('../../utils/util.js')
var presets
Page({
  data: {
    nickName: '',
    scrollViewId: '',
    events: [],
    WeekLength: '',
    WeekTimes: '',
    WeekWin: '',
    WeekWinRate: '',
    WeekMostUsed: '',
    WeekWinRate: ''

  },
  btnStart: function() {
    this.setData({
      scrollViewId: 'personal'
    })
  },
  onLoad: function() {
    var that = this;
    presets = app.globalData.presets
    wx.showLoading({
      title: '请稍候...',
    })
    wx.getStorage({
      key: 'nickName',
      success: function(res) {
        that.setData({
          nickName: res.data,
          subscription: true
        })
      },
    })
    wx.request({
      // url: 'https://www.bphots.com/week/api/report/personal/' + app.globalData.lastWeekNumber + '/' + app.globalData.playerId,
      url: 'https://www.bphots.com/week/api/report/personal/2532/681',
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'POST',
      success: function(info) {
        wx.hideLoading()
        var presetsObj = util.parseFields(info.data)
        presetsJs.setDataPersonal(presetsObj)
        presetsJs.setDataGlobal(app.globalData.dataGlobal)

        var localEvents = [];
        for (var i in presetsJs.getEvents()) {
          var item = presetsJs.getEvents()[i]
          var title = item[0]
          var content = item[1]()
          if (content !== false) {
            var e = {
              title: title[1], 
              content: content[1]
            }
            localEvents.push(e)
          }
        }
        that.setData({
          WeekLength: presetsJs.getCounter().WeekLength[1]()[1],
          WeekTimes: presetsJs.getCounter().WeekTimes[1]()[1],
          WeekWin: presetsJs.getCounter().WeekWin[1]()[1],
          WeekWinRate: presetsJs.getCounter().WeekWinRate[1]()[1],
          WeekMostUsed: presetsJs.getCounter().WeekMostUsed[1]()[1],
          WeekWinRate: presetsJs.getCounter().WeekMostUsed[1]()[2],
          events: localEvents
        })

      },
      fail: function(e) {
        wx.hideLoading()
        console.log(e);
      }
    })
  }
})