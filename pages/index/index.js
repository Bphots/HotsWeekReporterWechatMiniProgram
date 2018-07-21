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
    counterRange: 0,
    globalGamesCount: 0,
    WeekBasic: [],
    WeekGlobalBasic: [],
    WeekMostUsed: [],
    WeekGlobalMostUsed: [],
    WeekGlobalHighestWinRate: [],
  },
  changeCounterRange: function() {
    var range = this.data.counterRange ? 0 : 1
    this.setData({
      counterRange: range,
    })
  },
  btnStart: function() {
    this.setData({
      scrollViewId: 'personal'
    })
  },
  showToastDeveloping: function () {
    wx.showToast({
      title: '功能开发中……',
      // icon: 'loading',
      duration: 1000,
      mask: true
    })
  },
  showCounterMore: function () {
    this.showToastDeveloping()
  },
  showEventsMore: function () {
    this.showToastDeveloping()
  },
  medalDraw: function () {
    this.showToastDeveloping()
  },
  numberFormat: function (number, decimals, dec_point, thousands_sep) {
    /*
    * 参数说明：
    * number：要格式化的数字
    * decimals：保留几位小数
    * dec_point：小数点符号
    * thousands_sep：千分位符号
    * */
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.ceil(n * k) / k;
      };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
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
      url: 'https://www.bphots.com/week/api/report/personal/2533/681',
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
        var events = presetsJs.getEvents()
        for (var i in events) {
          var item = events[i]
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
        var counter = presetsJs.getCounter()
        that.setData({
          WeekBasic: counter.WeekBasic(),
          WeekGlobalBasic: counter.WeekGlobalBasic(),
          WeekGlobalMostUsed: counter.WeekGlobalMostUsed(),
          WeekGlobalHighestWinRate: counter.WeekGlobalHighestWinRate(),
          WeekMostUsed: counter.WeekMostUsed(),
          events: localEvents,
          globalGamesCount: that.numberFormat(counter.WeekGlobalBasic()[0][1].split(' ')[0], 0, ".", ","),
        })
      },
      fail: function(e) {
        wx.hideLoading()
        console.log(e);
      }
    })
  }
})