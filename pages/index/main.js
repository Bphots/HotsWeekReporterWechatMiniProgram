var presets
var dataGlobal
var dataRanking
var dataPersonal
var playerInfo
// var timestamp = Math.round(new Date().getTime() / 1000)
// var weekNumber = Math.trunc((timestamp + 345600) / 604800) + 1;
var urlPresets = 'https://www.bphots.com/week/api/report/presets'
var urlGlobal = 'https://www.bphots.com/week/api/report/global/' + weekNumber
var urlRanking = 'https://www.bphots.com/week/api/report/ranking/' + weekNumber
var urlPersonal = 'https://www.bphots.com/week/api/report/personal/' + weekNumber + '/' + playerID

var fetchData = function (url, params = null) {
	return new Promise((resolve, reject) => {
		fetch(url).then(response => response.json()).then((data) => {
			resolve(data)
		}, (error) => {
			reject(error)
		})
	})
}

var parseFields = function (data) {
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

var findMax = function (_sumMax, index, _data) {
	for (var i in presets) {
		var field = presets[i]
		if (_data[i] !== undefined && (_sumMax[field] === undefined || _sumMax[field][1] < _data[i].sum)) {
			_sumMax[field] = [index, _data[i].sum]
		}
	}
	return _sumMax
}

var matchPresets = function (_data) {
	var _parsedObj = {}
	for (var i in presets) {
		if (_data[i] !== undefined) {
			_parsedObj[presets[i]] = _data[i]
		}
	}
	return _parsedObj
}

Promise.all([
	fetchData(urlPresets),
	fetchData(urlGlobal),
	fetchData(urlRanking),
	fetchData(urlPersonal),
]).then(function ({
	0: presets,
	1: dataGlobal,
	2: dataRanking,
	3: dataPersonal
}) {
	window.playerInfo = dataPersonal.PlayerInfo
	window.presets = presets
	window.dataGlobal = parseFields(dataGlobal)
	window.dataRanking = parseFields(dataRanking)
	window.dataPersonal = parseFields(dataPersonal)
	console.log(window.dataGlobal)
	console.log(window.dataRanking)
	console.log(window.dataPersonal)
	main()
})

var main = function () {
	// do someting
	counter = window.counter
	events = window.events
	document.write('<h2>Player: ' + playerInfo.name + ' (from region ' + playerInfo.region + ')</h2>' + "<br />")
	for (var i in counter) {
		var item = counter[i]
		var title = item[0]
		var content = item[1]()
		if (content !== false) {
			document.write(title[lang] + ': ' + content[lang] + "<br />")
		}
	}
	for (var i in events) {
		var item = events[i]
		var title = item[0]
		var content = item[1]()
		// if (content !== false) {
		document.write(title[lang] + ': ' + content[lang] + "<br />")
		// }
	}
}