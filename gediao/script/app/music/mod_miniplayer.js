/**
 * 仅该页面实现实际播放,其余页面实现跨Frame调用该页面的方法即可
 */

//netAudio功能模块对象
var netAudio;
//百度音乐API对象
var bm;
//当前歌曲列表
var songlist;

//榜单类型
var type = 1;
//获取数量
var sum = 10;
//偏移量
var offset = 0;
//游标,大小由sum变量决定
var i = 0;

//总时长(s)
var duration = 0;
//当前播放位置(s)
var current = 0;

//当前播放状态
var isplay = "off";
var ispause = "0";
//暂停标记

/**
 * 增加播放列表数据(提供给其他脚本使用)
 * songObj:歌曲对象(必须包含song_id,title,author)
 * isRunNow:添加之后是否立即播放
 */
function add2SongList(songObj, isRunNow) {
	console.log("更新播放列表:"+JSON.stringify(songObj)+"|"+isRunNow);
	var sign = "0";
	//默认为不存在
	for (var j = 0; j < songlist.length; j++) {
		if (songid == songlist[j].song_id) {
			sign = "1"
			i = j;
			//更新索引
			scriptFrame(modRadioDetail, "oneRadio(" + i + ")");
			//通话并播放
			break;
		}
	}
	//不存在则,加入播放列表再播放
	if (sign == "0") {
		songlist.push(songObj);
		$api.setStorage("localSongList", songlist);
		if (isRunNow) {
			i = songlist.length;
			$api.byId("radio-play").click();
		}
	}
}

/**
 * 从播放列表中删除指定节点
 */
function remove2SongList(ri) {
	songlist.splice(ri, 1);
	$api.setStorage("localSongList", songlist);
}

/**
 * 清空播放列表
 */
function removeAllSongList() {
	songlist.splice(0, songlist.length);
	$api.setStorage("localSongList", songlist);
}

function realPlay() {
	//拿到当前游标指向的歌曲
	var song = songlist[i];
	$api.byId('radio-info').innerHTML = "正在载入...";
	bm.send(bm.info(song.song_id), function(ret, err) {
		console.log(ret);
		$api.setStorage("NowSongList", songlist);
		$api.setStorage("NowSongI", i);
		$api.setStorage("NowSongInfo", ret.songinfo);
		//下面这一句会出现运行时错误,所以直接存储在本地缓存中
		//		scriptFrame(modRadioDetail, 'synchData('+songlist+','+i+','+ret.songinfo+');');//播放过程中,同步数据给需要的页面
		/**
		 * 存储到最近收听
		 */
		api.setPrefs({
			key : 'nearListenId',
			value : song.song_id
		});
		api.setPrefs({
			key : 'nearListenInfo',
			value : song.title + " - " + song.author
		});
		var token = $api.getStorage("loginToken");
		var userId = $api.getStorage("loginUserId");
		if (token && ispause == '0') {//登录了 && 没有暂停过
			var mcm = initMCM();
			var query = api.require('query');
			query.createQuery(function(ret, err) {
				if (ret) {
					query.whereEqual({
						qid : ret.qid,
						column : 'userId',
						value : userId
					});
					query.whereEqual({
						qid : ret.qid,
						column : 'songId',
						value : song.song_id
					});
					mcm.findAll({
						class : "listenHistory",
						qid : ret.qid
					}, function(retu, err) {
						console.log(JSON.stringify(retu))
						if (retu.length > 0) {//有匹配数据,更新云端计数器
							mcm.updateById({
								class : 'listenHistory',
								id : retu[0].id,
								value : {
									num : parseInt(retu[0].num + 1)
								}
							}, function(ret, err) {
								if (ret) {
									console.log(JSON.stringify(ret));
								} else {
									console.log(JSON.stringify(err));
								}
							});
						} else {//无匹配数据,新增
							mcm.insert({
								class : 'listenHistory',
								value : {
									userId : userId,
									songId : song.song_id,
									songTitle : song.title + " - " + song.author,
									num : 1
								}
							}, function(ret, err) {
								if (ret) {
									console.log(JSON.stringify(ret));
								} else {
									console.log(JSON.stringify(err));
								}
							});
						}
					});
				} else {
					var tip = "未知错误,请检查网络连接状态！";
					alert(tip);
				}
			});
		}

		duration = 0;
		//重置时长指示器
		current = 0;
		netAudio.play({
			path : ret.bitrate.file_link
		}, function(nret, err) {
			if (nret) {
				$api.byId('radio-info').innerHTML = song.title + " - " + song.author;
				if (nret.complete) {//播放完了,自动下一曲
					ispause = "0";
					nextRadio();
				}
				//播放时长监控显示
				duration = nret.duration;
				//音频总时长，单位为s
				current = nret.current;
				//当前播放位置，单位为s
				var tempDuration = parseInt(duration);
				var tempCurrent = parseInt(current);
				var tempProgress = parseInt(Math.round(tempCurrent / tempDuration * 10000) / 100);
				//				netAudio.setProgress({//跳转播放位置：（可选项）播放位置百分比，取值范围：0-100(默认0)
				//				    progress: tempProgress
				//				});
				$api.css($api.byId('radio-progress'), "width: " + tempProgress + "%;");
				//这里需要监听目标Frame是否存在,否则会报运行时异常
				var iszai = $api.getStorage("isModRadioDetailOpen");
				if (iszai)
					scriptFrame(modRadioDetail, 'progressControl("' + duration + '","' + current + '");');
				//播放过程中,实时把播放进度传给需要的页面
			}
		});
	});
}

//播放暂停
function playRadio(it) {
	console.log(debug(arguments));
	if ($(it).hasClass('pause')) {
		$(it).removeClass().addClass('play');
		isplay = "off";
		ispause = "1";
		netAudio.pause();
	} else {
		$(it).removeClass().addClass('buffer');
		isplay = "on";
		setTimeout(function() {
			$(it).removeClass().addClass('pause');
			realPlay();
		}, 300);

	}
}

//脚本控制播放和暂停,给需要的页面调用
function playRadioControl(action) {
	var it = $api.byId("radio-play");
	if (action == "pause") {//暂停
		$(it).removeClass().addClass('pause');
	} else {
		$(it).removeClass().addClass('play');
	}
	playRadio(it);
}

//播放下一首
function nextRadio() {
	console.log(debug(arguments));
	ispause = "0";
	i++;
	if (i > 9) {//当最后一首播放完之后,重新播放第一首
		i = 0;
	}
	netAudio.stop();
	var it = $api.byId("radio-play");
	if ($(it).hasClass('play')) {//暂停状态
		var song = songlist[i];
		$api.byId('radio-info').innerHTML = song.title + " - " + song.author;
	} else {
		realPlay();
	}
	scriptFrame(modRadioList, 'nextFocus();');
}

//播放上一首
function prevRadio() {
	console.log(debug(arguments));
	ispause = "0";
	i--;
	if (i <= 0) {
		i = 0;
	}
	netAudio.stop();
	var it = $api.byId("radio-play");
	if ($(it).hasClass('play')) {//暂停状态
		var song = songlist[i];
		$api.byId('radio-info').innerHTML = song.title + " - " + song.author;
	} else {
		realPlay();
	}
	scriptFrame(modRadioList, 'prevFocus();');
}

//直接跳转到某一首播放
function oneRadio(j) {
	i = j;
	netAudio.stop();
	var it = $api.byId("radio-play");
	if ($(it).hasClass('play')) {//暂停状态
		var song = songlist[i];
		$api.byId('radio-info').innerHTML = song.title + " - " + song.author;
	} else {
		realPlay();
	}
	scriptFrame(modRadioList, 'oneFocus(' + j + ');');
}

//打开播放列表
function openRadioList() {
	console.log(debug(arguments));
	if (songlist.length >= 0) {
		loading("加载中");
		var isRadioListFrameOpen = $api.getStorage('isRadiolistFrameOpen');
		console.log(isRadioListFrameOpen);
		if (isRadioListFrameOpen == 'false' || isRadioListFrameOpen == undefined) {//未打开
			console.log("还未打开。。。")
			var height = api.winHeight - 55;
			$api.setStorage('isRadiolistFrameOpen', 'true');
			api.openFrame({
				name : modRadioList,
				url : "../../" + modRadioListURL,
				bounces : false,
				bgColor : 'rgba(0,0,0,0.6)',
				rect : {
					x : 0,
					y : 0,
					w : api.winWidth,
					h : height
				},
				pageParam : {//传递页面参数,新页面通过api.pageParam获取
					songlist : songlist,
					nowsongid : songlist[i].song_id
				}
			});
		} else {//打开了
			scriptFrame(modRadioList, 'closeThis();');
		}
		finishing();
	}
}

//音频详细:打开页面,传递相关播放数据,目标页面不实现播放功能(仅仅只是假的播放效果,具体还是本Frame播放音乐)
function openRadioDetail() {
	console.log(debug(arguments));
	if (songlist.length >= 0) {
		loading("加载中");
		api.openFrame({
			name : modRadioDetail,
			url : "../../" + modRadioDetailURL,
			animation : {
				type : 'movein',
				subType : "from_right"
			},
			pageParam : {//传递页面参数,新页面通过api.pageParam获取
				songlist : songlist,
				nowsongid : songlist[i].song_id,
				nowi : i,
				duration : duration,
				current : current,
				isplay : isplay
			}
		}, function() {
			finishing();
		});
	}
}

/**
 * 更新Songlist数据
 */
function updateData() {
	var localList = $api.getStorage("localSongList");
	console.log("本地播放列表历史：" + JSON.stringify(localList));
	if (localList) {
		if (localList.length < 0) {
			$api.byId('radio-info').innerHTML = "请选择歌曲播放...";
		} else {
			songlist = localList;
			$api.byId('radio-info').innerHTML = songlist[0].title + " - " + songlist[0].author;
		}
	} else {
		//第一次使用,直接获取热歌榜单的前10首歌
		bm.send(bm.list(type, sum, offset), function(ret, err) {
			console.log(writeObj(ret))
			songlist = ret.song_list;
			console.log(writeObj(songlist))
			$api.byId('radio-info').innerHTML = songlist[0].title + " - " + songlist[0].author;
			$api.setStorage("localSongList", songlist);
			//需要注意:里面存储的是排行榜对象,而不是歌曲实体对象
		});
	}
}

apiready = function() {
	console.log(debug(arguments));
	$api.rmStorage('isRadiolistFrameOpen');
	netAudio = api.require('netAudio');
	//申请netAudio模块
	bm = new baiduMusic();
	updateData();
	//是否开启自动播放
	var isAutoPlay = api.getPrefs({
		sync : true,
		key : 'isAutoPlay'
	});
	if (isAutoPlay == 'on') {
		$api.byId("radio-play").click();
	}
};
