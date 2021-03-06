//index.js
import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
const presetsJs = require('presets.js')
const util = require('../../utils/util.js')
const config = require('../../config.js')
var presets
Page({
  data: {
    ec: {
      lazyLoad: true
    },
    chart: null,
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
    radarData: [0, 0, 0, 0, 0],
    isMedalDraw: true
  },
  //分享
  onShareAppMessage: function(res) {
    return {
      title: ' 获取好友「' + app.globalData.playerInfo.Name + '」的背锅周报，看看他的故事',
      path: '/pages/weekReport/weekReport?playerID=' + app.globalData.playerInfo.PlayerId,
      imageUrl: 'https://www.bphots.com/images/weapp/share.jpg?' + util.timeStamp()
    }
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
    wx.pageScrollTo({
      scrollTop: 630,
      duration:400
    }
    )
  },
  showToastDeveloping: function() {
    wx.showToast({
      title: '功能开发中……',
      // icon: 'loading',
      duration: 1000,
      mask: true
    })
  },
  showCounterMore: function() {
    this.showToastDeveloping()
  },
  showEventsMore: function() {
    this.showToastDeveloping()
  },
  backLogin: function() {
    app.globalData.playerInfo = null
    wx.redirectTo({
      url: '../login/login',
    })
  },
  medalDraw: function() {
    wx.showLoading({
      title: '请稍候...',
    })
    wx.request({
      url: 'https://www.bphots.com/week/api/medaldraw/' + app.globalData.playerInfo.PlayerId,
      header: {
        'sessionid': app.globalData.sessionId
      },
      data: {
        'lang': 'zh-cn'
      },
      method: 'GET',
      success: function(res) {
        wx.hideLoading()
        if (res.data.result == 'Success') {
          var medalId = res.data.data.medal_id
          var medalName = res.data.data.medal_name
          var medalDesc = res.data.data.medal_desc
          var userExist = res.data.data.user_exist
          if (medalId !== null) {
            wx.showModal({
              title: '恭喜',
              content: '你获得了 [' + medalName + '] 一枚！',
              showCancel: false,
              success: function(res) {
                if (!userExist) {
                  wx.showModal({
                    title: '请注意',
                    content: '请在背锅助手官网 www.bphots.com 进行一次登录，避免战网改名导致勋章丢失',
                    showCancel: false,
                    success: function(res) {}
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '再接再厉',
              content: '很遗憾，你这次没有抽中，下次中奖概率已提高',
              showCancel: false,
              success: function(res) {}
            })
          }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail: function(e) {
        wx.showModal({
          title: '网络错误',
          content: '请稍后重试',
          showCancel: false,
          success: function(res) {}
        })
      }
    })
  },
  numberFormat: function(number, decimals, dec_point, thousands_sep) {
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
      toFixedFix = function(n, prec) {
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
  onReady: function(res) {
    console.log()
    if (this.data.isMedalDraw) {
      this.getReport()
    }
  },
  onLoad: function(res) {
    // var counter = presetsJs.getCounter
    // console.log(counter)
    // var events = presetsJs.getEvents
    // console.log(events)

    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    var that = this;
    presets = app.globalData.presets
    if (res.playerID != null) {
      this.getPlayer(res.playerID)
      //分享进入
      that.setData({
        isMedalDraw: false
      })
    } else {
      //普通进入      
      wx.showLoading({
        title: '请稍候...',
      })
      that.setData({
        nickName: app.globalData.playerInfo.Name + "#" + app.globalData.playerInfo.BattleTag,
      })
    }
  },
  //通过playerId获取角色信息
  getPlayer: function(playerID) {
    var that = this
    wx.showLoading({
      title: '请稍候...',
    })
    wx.request({
      url: config.service.reportUrl,
      data: {
        'player_id': playerID
      },
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'GET',
      success: function(info) {
        if (info.data.result != null && info.data.result == 'Success') {
          var playersInfo = info.data.data
          if (playersInfo != null && playersInfo.length > 0) {
            app.globalData.playerInfo = playersInfo[0]
            that.setData({
              nickName: app.globalData.playerInfo.Name + "#" + app.globalData.playerInfo.BattleTag,
            })
            that.getGlobalInfo()
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
      complete: function() {
        wx.hideLoading()
      }
    })
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
        that.getReport()
      },
      fail: function(e) {
        console.log(e);
      }
    })
  },
  //获取周报信息
  getReport: function() {
    // 获取组件
    var that = this;
    wx.request({
      url: 'https://www.bphots.com/week/api/report/personal/' + app.globalData.playerInfo.LastWeekNumber + '/' + app.globalData.playerInfo.PlayerId,
      // url: 'https://www.bphots.com/week/api/report/personal/2533/681',
      header: {
        'sessionid': app.globalData.sessionId
      },
      method: 'POST',
      success: function(info) {
        if (!info.data) {
          wx.hideLoading()
          wx.showModal({
            title: '抱歉',
            content: '我们没有你本周的对战记录TwT',
            showCancel: false,
            success: function(res) {
              wx.navigateBack({
                delta: -1
              });
            }
          })
        } else {
          wx.hideLoading()
          var presetsObj = util.parseFields(info.data)
          presetsJs.setDataPersonal(presetsObj)
          presetsJs.setDataGlobal(app.globalData.dataGlobal)

          var localEvents = [];
          var events = presetsJs.getEvents()
          var counters = presetsJs.getCounter()
          console.log(events)
          console.log(counter)
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
          console.log(that.data.radarData)
          that.data.radarData = presetsJs.buildRadar()
          console.log(that.data.radarData)
          var counter = presetsJs.getCounter()
          // console.log('request data')
          that.init()
          that.setData({
            WeekBasic: counter.WeekBasic(),
            WeekGlobalBasic: counter.WeekGlobalBasic(),
            WeekGlobalMostUsed: counter.WeekGlobalMostUsed(),
            WeekGlobalHighestWinRate: counter.WeekGlobalHighestWinRate(),
            WeekMostUsed: counter.WeekMostUsed(),
            events: localEvents,
            globalGamesCount: that.numberFormat(counter.WeekGlobalBasic()[0][1].split(' ')[0], 0, ".", ","),
          })
        }
      },
      fail: function(e) {
        wx.hideLoading()
        console.log(e);
      }
    })
  },
  // 点击按钮后初始化图表
  init: function() {
    // console.log('ecCanvas init', this.ecComponent)
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      // console.log(canvas, width, height)
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart);
      // console.log('chart setted', echarts)
      this.setOption(chart);
      // console.log('option setted')

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  setOption: function(chart) {
    var option = {
      backgroundColor: "#ffffff",
      color: ["#37A2DA", "#FF9F7F"],
      tooltip: {},
      xAxis: {
        show: false
      },
      yAxis: {
        show: false
      },
      radar: {
        // shape: 'circle',
        indicator: [{
            name: 'KDA',
            max: 100
          },
          {
            name: '击杀',
            max: 100
          },
          {
            name: '生存',
            max: 100
          },
          {
            name: '雇佣兵',
            max: 100
          },
          {
            name: '经验',
            max: 100
          }
        ]
      },
      series: [{
        name: '个人 vs 全球',
        type: 'radar',
        data: [{
            value: this.data.radarData,
            name: '个人'
          },
          {
            value: [60, 60, 60, 60, 60, 60],
            name: '全球'
          }
        ]
      }]
    };
    chart.setOption(option);
  }
})