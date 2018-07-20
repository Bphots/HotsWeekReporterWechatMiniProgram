//index.js
const app = getApp()
const presetsJs = require('presets.js')
var presets
Page({
  data: {
    nickName: '',
  },

  onLoad: function() {
    var that = this;
    presets = app.globalData.presets
    wx.showLoading({
      title: '请稍后...',
    })
    wx.getStorage({
      key: 'nickName',
      success: function (res) {
        that.data.nickName = res.data
        that.data.subscription = true
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
        var presetsObj = parseFields(info.data)
        console.log(presetsObj);
        presetsJs.dataPersonal = presetsObj

        console.log(presetsJs.dataPersonal);

        console.log(presetsJs.counter.WeekLength);
        console.log(presetsJs.events);
        console.log(presetsJs.HeroInf);
        
      },
      fail: function(e) {
        wx.hideLoading()
        console.log(e);
      }
    })
  }
})
var parseFields = function(data) {
  var parsedObj = {}
  for (var i in data) {
    if (i === 'PlayerBase') {
      parsedObj[i] = matchPresets(data[i])
    } else {
      parsedObj[i] = {}
      var _sumMax = {}
      for (var j in data[i]) {
        parsedObj[i][j] = matchPresets(data[i][j])
        _sumMax = findMax(_sumMax, j, data[i][j])
      }
      parsedObj[i]['_sumMax'] = _sumMax
    }
  }
  return parsedObj
}
var matchPresets = function(_data) {
  var _parsedObj = {}
  for (var i in presets) {
    if (_data[i] !== undefined) {
      _parsedObj[presets[i]] = _data[i]
    }
  }
  return _parsedObj
}
var findMax = function(_sumMax, index, _data) {
  for (var i in presets) {
    var field = presets[i]
    if (_data[i] !== undefined && (_sumMax[field] === undefined || _sumMax[field][1] < _data[i].sum)) {
      _sumMax[field] = [index, _data[i].sum]
    }
  }
  return _sumMax
}