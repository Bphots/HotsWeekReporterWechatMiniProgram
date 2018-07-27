const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//映射转换
var parseFields = function(data) {
  var parsedObj = {}
  for (var i in data) {
    if (i === 'PlayerBase' || i === 'PlayerRankings') {
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
var matchPresets = function(_data, ) {
  var app = getApp()
  var presets = app.globalData.presets
  var _parsedObj = {}
  for (var i in presets) {
    if (_data[i] !== undefined) {
      _parsedObj[presets[i]] = _data[i]
    }
  }
  return _parsedObj
}
var findMax = function(_sumMax, index, _data) {
  var app = getApp()
  var presets = app.globalData.presets
  for (var i in presets) {
    var field = presets[i]
    if (_data[i] !== undefined && (_sumMax[field] === undefined || _sumMax[field][1] < _data[i].sum)) {
      _sumMax[field] = [index, _data[i].sum]
    }
  }
  return _sumMax
}
//获取使用地区ID换取地区名称
function getRegionName(regionID) {
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
}
//通过用户ID获取本地存储的用户信息
function getLocalPlayerInfo(playerId){
  var app = getApp()
  for (var i in app.globalData.playersInfo) {
    var playInfo = app.globalData.playersInfo[i]
    if (playInfo.PlayerId == playerId) {
      return playInfo
    }
  }
}   
//删除指定id记录
function deletePlayers(playerId){
  var app = getApp();
  for (var i in app.globalData.playersInfo) {
    var playInfo = app.globalData.playersInfo[i]
    if (playInfo.PlayerId == playerId) {
      app.globalData.playersInfo.splice(i, 1)
      break
    }
  }
}

module.exports = {
  formatTime: formatTime,
  parseFields: parseFields,
  getRegionName: getRegionName,
  getLocalPlayerInfo: getLocalPlayerInfo,
  deletePlayers: deletePlayers
}