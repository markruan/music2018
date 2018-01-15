/**
 * 歌词解析器
 * @author chitry@126.com
 * @date 2017.04.23 13:16:48
 */

/**
 * 解析歌词,得到一个存放了歌词信息的数组
 * 
 * 在调用下面的方法之前,需要先调用这个方法
 * @param {Object} lyric lyric格式文件内容
 */
function parseLyrics(lyric) {
//	var lines = lyric.split('\n'), pattern = /\[\d{2}:\d{2}.\d{2}\]/g, result = [];
//	while (!pattern.test(lines[0])) {
//		lines = lines.slice(1);
//	};
//	console.log(lines);
//	lines[lines.length - 1].length === 0 && lines.pop();
//	_.each(lines, function(data, step) {
//		var index = data.indexOf(']');
//		var time = data.substring(0, index + 1), value = data.substring(index + 1);
//		var timeString = time.substring(1, time.length - 2);
//		var timeArr = timeString.split(':');
//		result.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
//
//	});
//	result.sort(function(a, b) {
//		return a[0] - b[0];
//	});
var lines = lyric.split('\n')
	return lines;
}

/**
 * 遍历加载歌词数据,并回调 (传入通过parseLyric方法得到的lyric数组)
 * 
 * @param {Object} lyric
 * @param {Object} callback
 */
function loadLyrics(lyric,callback) {
	if ( typeof callback !== 'function') {//检查回调函数是否可用调用的
		callback = false;
	}
	_.each(lyric, function(content, index, $) {
		callback(index,content[1]);
//		var lyricContent = $('#show-lrc-content');
//		lyricContent.append('<p name="lyric" id=' + index + '>' + content[1] + '</p>');
	});
}

/**
 * 获取指定时间的歌词数据,并回调
 *  
 * @param {Object} currTime
 * @param {Object} callback
 */
function getLyrics(lyric, currTime, callback) {
	if ( typeof callback !== 'function') {//检查回调函数是否可用调用的
		callback = false;
	}
	for (var i = 0; i < lyric.length; i++) {
//		console.log(lyric[i]);
		if (lyric[i].indexOf(currTime) > 0) {
			callback(i);//回调
			break;
//			$('p[name=lyric]').css('color', '#fff');
//			$('p#' + i).css('color', '#a6e22d');
//
//			$('.lyric-content').css('top', 210 - 30 * (i + 1));
		}
	};

}

