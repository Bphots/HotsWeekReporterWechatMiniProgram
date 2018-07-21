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
var parseFields = function (data) {
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
  console.log(parsedObj)
  return parsedObj
}
var matchPresets = function (_data,) {
var  app = getApp()
  var presets = app.globalData.presets
  var _parsedObj = {}
  for (var i in presets) {
    if (_data[i] !== undefined) {
      _parsedObj[presets[i]] = _data[i]
    }
  }
  return _parsedObj
}
var findMax = function (_sumMax, index, _data) {
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

module.exports = {
  formatTime: formatTime,
  parseFields: parseFields
}
