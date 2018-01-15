//用户登录授权和用户id
var songList;
var songdetail;//当前播放歌曲的详细数据信息(包括歌词数据和下载地址等字段信息)
var token;
var userId;
/**
 * 前往登录
 */
function goLogin() {
    api.openFrame({
        name: modMineLogin,
        url: "../../" + modMineLoginURL,
        bounces: false,
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        }
    });
}
/**
 * 更多菜单
 */
function doMore() {
    notification();
    var mnPopups = api.require('MNPopups');
    mnPopups.open({
        rect: {
            w: 105,
            h: 105
        },
        position: {
            x: api.winWidth - 20,
            y: 55
        },
        styles: {
            mask: 'rgba(0,0,0,0.2)',
            bg: '#eee',
            corner: 5,
            cell: {
                bg: {
                    normal: '',
                    highlight: ''
                },
                h: 35,
                title: {
                    marginL: 45,
                    color: '#636363',
                    size: 12,
                },
                icon: {
                    marginL: 10,
                    w: 25,
                    h: 25,
                    corner: 2
                }
            },
            pointer: {
                size: 7,
                xPercent: 90,
                yPercent: 0,
                orientation: 'downward'
            }
        },
        datas: [{
            title: '我的收藏',
            icon: 'widget://image/userinfo_collection.png'
        }, {
            title: '最近收听',
            icon: 'widget://image/userinfo_history.png'
        }, {
            title: '报错',
            icon: 'widget://image/userinfo_conversations.png'
        }],
        animation: true
    }, function (ret) {
        if (ret) {
            notification();
            token = $api.getStorage("loginToken");
            userId = $api.getStorage("loginUserId");
            if (ret.index == 0) {
                if (token) {
                    api.openFrame({
                        name: "mod_collect",
                        url: "../../" + "html/mine/mod_collect.html",
                        bounces: false,
                        animation: {
                            type: "movein", //动画类型（详见动画类型常量）
                            subType: "from_right", //动画子类型（详见动画子类型常量）
                            duration: 300 //动画过渡时间，默认300毫秒
                        }
                    });
                } else {//未登录,先登录
                    goLogin();
                }
            } else if (ret.index == 1) {
                if (token) {
                    api.openFrame({
                        name: "mod_listen",
                        url: "../../" + "html/mine/mod_listen.html",
                        bounces: false,
                        animation: {
                            type: "movein", //动画类型（详见动画类型常量）
                            subType: "from_right", //动画子类型（详见动画子类型常量）
                            duration: 300 //动画过渡时间，默认300毫秒
                        }
                    });
                } else {//未登录,先登录
                    goLogin();
                }
            } else if (ret.index == 2) {
                if (token) {//已登录
                    api.openFrame({
                        name: "mod_feedback",
                        url: "../../" + "html/mine/mod_feedback.html",
                        bounces: false,
                        animation: {
                            type: "movein", //动画类型（详见动画类型常量）
                            subType: "from_right", //动画子类型（详见动画子类型常量）
                            duration: 300 //动画过渡时间，默认300毫秒
                        },
                        pageParam: {//传递页面参数,新页面通过api.pageParam获取
                            fbContent: "歌曲:" + songList[zxxAudio.cursor].title + " - " + songList[zxxAudio.cursor].author + "播放存在异常情况(匹配代码:" + songList[zxxAudio.cursor].song_id + "-" + userId + "),请尽快修复！"
                        }
                    });
                } else {//未登录,去登陆
                    goLogin();
                }
            }
        }
    });
}


//富播放器对象
var zxxAudio = new Object();
var tempLyricStr = "";
zxxAudio.loadLyric = function () {
    // console.log("LOADLYRIC:"+$api.trim(tempLyricStr));
    if (zxxAudio.lyric.length > 0) {
        var lrcMinutes = parseInt(zxxAudio.current / 60);
        lrcMinutes = (lrcMinutes < 10) ? "0" + lrcMinutes : lrcMinutes;
        var lrcSeconds = parseInt(zxxAudio.current % 60);
        lrcSeconds = (lrcSeconds < 10) ? "0" + lrcSeconds : lrcSeconds;
        var lrctime = lrcMinutes + ":" + lrcSeconds;
        // console.log(zxxAudio.current + "|" + lrctime);
        getLyrics(zxxAudio.lyric, lrctime, function (i) {
            console.log("当前歌词：" + zxxAudio.lyric[i].split(']')[1]);
            $api.text($api.byId("zxx-song-lrc"), zxxAudio.lyric[i].split(']')[1]);
        });
    } else {
        $api.text($api.byId("zxx-song-lrc"), "暂未匹配到对应歌词数据");
    }
}
/**
 * 获取歌曲数据
 */
zxxAudio.getLyric = function () {
    //拿到歌词数据
    this.bm.send(this.bm.lrc(songList[this.cursor].song_id), function (ret, err) {
        //解析歌词得到数组
        $api.text($api.byId("zxx-song-lrc"), "");
        if (ret) {
            tempLyricStr = ret.lrcContent;
            zxxAudio.lyric = parseLyrics(ret.lrcContent);
            // console.log("歌词：" + lyric);
            zxxAudio.loadLyric();
        } else {
            $api.text($api.byId("zxx-song-lrc"), "歌词数据载入失败");
        }
    });
}
/**
 * 播放进度控制,本方法由miniplayer页面控制实时调用
 */
zxxAudio.progressControl = function (cursor, duration, current,iscomplte) {
    if(iscomplte == true){//播放完了
        zxxAudio.updateView();
    }else{
        console.log("dZXX:"+cursor+"|"+zxxAudio.cursor+"|"+this.cursor);
        if(cursor != zxxAudio.cursor){//提供容错能力
            zxxAudio.cursor = cursor;
            zxxAudio.isplay = "on"
            $("#radio-play").removeClass().addClass('buffer');
            $("#radio-play").removeClass().addClass('pause');
            $("#zxx-song-pic").removeClass().addClass("Rotation");
            zxxAudio.updateView();
            this.showCollect();
        }
        this.duration = duration;
        this.current = current;
        //当前播放位置，单位为s
        var tempDuration = parseInt(duration);
        var tempCurrent = parseInt(current);
        var tempProgress = parseInt(Math.round(tempCurrent / tempDuration * 10000) / 100);
        //				netAudio.setProgress({//跳转播放位置：（可选项）播放位置百分比，取值范围：0-100(默认0)
        //				    progress: tempProgress
        //				});
        //				$api.css($('#radio-progress'), "width: " + tempProgress + "%;");
        var ttfdur = parseInt(duration / 60);
        ttfdur = (ttfdur < 10) ? "0" + ttfdur : ttfdur;
        var ttmdur = parseInt(duration % 60);
        ttmdur = (ttmdur < 10) ? "0" + ttmdur : ttmdur;
        var ttfcur = parseInt(current / 60);
        ttfcur = (ttfcur < 10) ? "0" + ttfcur : ttfcur;
        var ttmcur = parseInt(current % 60);
        ttmcur = (ttmcur < 10) ? "0" + ttmcur : ttmcur;
        $api.byId("slider-dur").innerHTML = ttfdur + ":" + ttmdur;
        $api.byId("slider-cur").innerHTML = ttfcur + ":" + ttmcur;
        if(zxxAudio.progress != 0){
            tempProgress = parseInt(zxxAudio.progress);
            zxxAudio.progress = 0;
        }
        zxxAudio.slider.setValue({
            value: tempProgress
        });
        zxxAudio.loadLyric();
    }
}
/**
 * 更新前端显展示
 */
zxxAudio.updateView = function(){
    songList = $api.getStorage("localSongList");
    zxxAudio.cursor = $api.getStorage("NowSongCursor");
    console.log("更新展示："+zxxAudio.cursor+"|"+JSON.stringify(songList));
    if(songList.length <= 0){
        zxxAudio.goBack();
    }else{
        if (zxxAudio.cursor >= songList.length) {//当最后一首播放完之后,重新播放第一首
            zxxAudio.cursor = 0;
        }
        console.log("更新展示："+zxxAudio.cursor+"|"+songList.length+"|"+JSON.stringify(songList[zxxAudio.cursor]))
        $api.byId('zxx-title').innerHTML = songList[zxxAudio.cursor].title;
        $api.attr($api.byId("zxx-song-pic"), "src", songList[zxxAudio.cursor].pic_big);
        zxxAudio.synchron();
        zxxAudio.showCollect(songList[zxxAudio.cursor]);
        this.getLyric();
    }
}
/**
 * 该方法提供给外部使用,传入一个歌曲id,加入songList,并选择是否立即播放
 */
zxxAudio.playOne = function (songid) {
    //对当前播放列表遍历,判断目标歌曲是否已经存在,若存在则直接播放,不存在则加入播放列表再播放
    this.bm.send(this.bm.info(songid), function (ret, err) {
        console.log("获取新歌数据：" + JSON.stringify(ret));
        var sign = "0";//默认为不存在
        for (var j = 0; j < songList.length; j++) {
            if (songid == songList[j].song_id) {
                sign = "1"
                zxxAudio.cursor = j;//更新索引
                $api.setStorage('targetSong', songList[zxxAudio.cursor]);
                scriptCross('root',modMiniPlayer, "audio.goto()");//通信并播放
                break;
            }
        }
        //不存在则,加入播放列表再播放
        if (sign == "0") {
            songList.push(ret.songinfo);
            $api.setStorage("localSongList", songList);
            console.log("更新播放列表:" + JSON.stringify(songList));
            zxxAudio.cursor = songList.length;//更新索引
            scriptCross('root',modMiniPlayer, "add2songList(" + ret.songinfo + ",true)");//通信并播放
        }
        songdetail = ret.songinfo;
        this.showCollect();
    });
}
/**
 * 播放暂停,需要同步配置到miniplayer
 * @param it
 */
zxxAudio.play = function (it) {
    console.log(debug(arguments));
    it = it ? it : $api.byId("radio-play");
    //拿到当前游标指向的歌曲
    var song = songList[zxxAudio.cursor];
    $api.byId('zxx-title').innerHTML = song.title;
    console.log(song.pic_big)
    $api.attr($api.byId("zxx-song-pic"), "src", songList[zxxAudio.cursor].pic_big);
    if ($(it).hasClass('pause')) {
        $(it).removeClass().addClass('play');
        scriptCross('root',modMiniPlayer, 'playRadioControl("pause");');
        $("#zxx-song-pic").removeClass().addClass("Rotation Rotation-pause");
    } else {
        $(it).removeClass().addClass('buffer');
        $(it).removeClass().addClass('pause');
        scriptCross('root',modMiniPlayer, 'playRadioControl("play");');
        $("#zxx-song-pic").removeClass().addClass("Rotation");
    }
    this.getLyric();
    this.showCollect();
}
/**
 * 下一首
 */
zxxAudio.next = function () {
    songList = $api.getStorage("localSongList");
    this.cursor++;
    if (this.cursor > songList.length) {//当最后一首播放完之后,重新播放第一首
        this.cursor = 0;
    }
    var song = songList[this.cursor];
    $api.byId('zxx-title').innerHTML = song.title;
    $api.attr($api.byId("zxx-song-pic"), "src", song.pic_big);
    scriptCross('root',modMiniPlayer, 'audio.next();');
    $api.text($api.byId("zxx-song-lrc"), "正在载入歌词...");
    this.getLyric();
    this.showCollect();
}

/**
 * 上一首
 */
zxxAudio.prev = function () {
    songList = $api.getStorage("localSongList");
    this.cursor--;
    if (this.cursor < 0) {
        this.cursor = 0;
    }
    var song = songList[this.cursor];
    $api.byId('zxx-title').innerHTML = song.title;
    $api.attr($api.byId("zxx-song-pic"), "src", song.pic_big);
    scriptCross('root',modMiniPlayer, 'audio.prev();');
    $api.text($api.byId("zxx-song-lrc"), "正在载入歌词...");
    this.getLyric();
    this.showCollect();
}

/**
 * 显示当前播放列表
 */
zxxAudio.showList = function () {
    notification();
    loading("加载中");
    console.log(debug(arguments));
    var isRadioListFrameOpen = $api.getStorage('isRadiolistFrameOpen');
    console.log(isRadioListFrameOpen);
    if (isRadioListFrameOpen == 'false' || isRadioListFrameOpen == undefined) {//未打开
        console.log("还未打开。。。")
        var height = api.winHeight - 55;
        $api.setStorage('isRadiolistFrameOpen', 'true');
        api.openFrame({
            name: modRadioList,
            url: "../../" + modRadioListURL,
            bounces: false,
            bgColor: 'rgba(0,0,0,0.6)',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        });
    } else {//打开了
        var jsfun = 'closeThis();';
        api.execScript({
            frameName: modRadioList,
            script: jsfun
        });
    }
    finishing();
}
/**
 * 播放进度条模块
 */
zxxAudio.zxxSlider = function () {
    var $slider = $('#slider');
    var sliderPos = $slider.offset();
    this.slider.open({
        x: 0,
        y: sliderPos.top + 10,
        w: api.winWidth,
        bgImg: "widget://image/slider/slider-bg.png", //背景图片
        selectedBgImg: "widget://image/slider/slider-fg.png", //slider滑块左边划过的区域图片
        bar: {//气泡设置,若不传则不显示滑块
            barWidth: 20, //（可选项）滑块宽，数字，默认30
            barHeight: 20, //（可选项）滑块的高，数字，默认18
            barImg: "widget://image/slider/slider-btn.png"//（可选项）滑块背景，字符串，默认#4f94dc，支持 rgb，rgba，#，img
        },
        bubble: {//气泡设置
            bubbleWidth: 0, ////（可选项）数字类型，默认60，气泡的宽
            bubbleHeight: 0//（可选项）数字类型，默认40，气泡的高
            //		    bubbleImg：    //（可选项）字符串，默认#5cacee，气泡背景，支持 rgb,rgba,#,img
            //		    titleSuffix：  //（可选项）字符串，默认℃，气泡后缀
            //		    titleColor：   //（可选项）字符串，默认#000000，支持 rgb，rgba，#
            //		    titleSize：    //（可选项）数字类型，默认13.0，气泡上字体大小
            //		    titlePosition：//（可选项）字符串类型，气泡标题位置，取值范围：left、right、center，默认center
        },
        minValue: 0, //slider最小值
        maxValue: 100, //slider最大值
        defValue: 0, //slider开启默认值
        fixedOn: api.frameName, //（可选项）模块视图添加到指定 frame 的名字（只指 frame，传 window 无效）
        fixed: true//（可选项）是否将模块视图固定到窗口上，不跟随窗口上下滚动
    }, function (ret, err) {
        if (ret.touchCancel) {
            //控制跳转
            notification();
            console.log(ret.value);
            zxxAudio.progress = ret.value;
            scriptCross('root',modMiniPlayer, 'audio.controlprogess('+ret.value+');');
        }
    });
}
/**
 * 下载音乐
 */
zxxAudio.doDownLoad = function (obj) {
    console.log("DOWNLOAD_OBJ:" + JSON.stringify(obj));
    //enqueue:开始一个下载
    var downloadManager = api.require('downloadManager');
    downloadManager.enqueue({
        url: obj.bitrate.file_link,//资源地址，不能为空
        savePath: 'fs://music/' + obj.songinfo.title + " - " + obj.songinfo.author + ".mp3",//存储路径，为空时使用自动创建的路径
        cache: true,//是否使用缓存
        allowResume: true,//是否开启断点续传，需要服务器支持
        title: obj.songinfo.title + " - " + obj.songinfo.author,//展示在managerView列表中的文件标题
        iconPath: obj.songinfo.pic_small,//该项下载显示在 managerView 中对应的图标
        networkTypes: 'all'//允许自动下载的网络环境，参考网络环境常量
    }, function (ret, err) {
        if (ret) {
            api.toast({
                msg: "正在下载 " + obj.songinfo.title + " - " + obj.songinfo.author,
                duration: 3000
            });
        } else {
            alert(JSON.stringify(err));
        }
    });
}

/**
 * 下载音乐
 */
zxxAudio.download = function () {
    notification();
    if (songdetail == undefined) {//还未获取详细歌曲信息
        this.bm.send(this.bm.info(songList[this.cursor].song_id), function (ret, err) {
            songdetail = ret;
            console.log(JSON.stringify(ret));
            zxxAudio.doDownLoad(ret);
        });
    } else {
        console.log(songdetail.bitrate.file_link)
        zxxAudio.doDownLoad(songdetail);
    }
}
/**
 * 当前歌曲此用户是否已经收藏
 */
zxxAudio.showCollect = function (songid) {
    var query = api.require('query');
    query.createQuery(function (ret, err) {
        if (ret) {
            token = $api.getStorage("loginToken");
            userId = $api.getStorage("loginUserId");
            query.whereEqual({
                qid: ret.qid,
                column: 'userId',
                value: userId
            });
            query.whereEqual({
                qid: ret.qid,
                column: 'songId',
                value: songid
            });
            zxxAudio.mcm.findAll({
                class: "collection",
                qid: ret.qid
            }, function (retu, err) {
                console.log(JSON.stringify(retu))
                if (retu.length > 0) {//已收藏
                    $api.addCls($api.byId("zxx-collect"), "active");
                    $api.text($api.byId("zxx-collect"), "已收藏");
                } else {//未收藏
                    $api.removeCls($api.byId("zxx-collect"), "active");
                    $api.text($api.byId("zxx-collect"), "收藏");
                }
            });
        }
    });
}

/**
 * 收藏音乐
 * @param ele
 */
zxxAudio.collect = function (ele) {
    notification();
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (token) {//已登录
        //1.判断当前歌曲是否已经收藏
        if (!$api.hasCls(ele, "active")) {
            this.mcm.insert({
                class: 'collection',
                value: {
                    userId: userId,
                    songId: songList[this.cursor].song_id,
                    songTitle: songList[this.cursor].title + " - " + songList[this.cursor].author,
                }
            }, function (ret, err) {
                if (ret) {
                    $api.addCls($api.byId("zxx-collect"), "active");
                    $api.text($api.byId("zxx-collect"), "已收藏");
                    showToast("收藏成功");
                    console.log(JSON.stringify(ret));
                } else {
                    showToast("收藏失败！请检查网络连接");
                    console.log(JSON.stringify(err));
                }
            });
        }else{//取消收藏
            var query = api.require('query');
            query.createQuery(function (ret, err) {
                if (ret) {
                    query.whereEqual({
                        qid: ret.qid,
                        column: 'userId',
                        value: userId
                    });
                    query.whereEqual({
                        qid: ret.qid,
                        column: 'songId',
                        value: songList[zxxAudio.cursor].song_id
                    });
                    zxxAudio.mcm.findAll({
                        class: "collection",
                        qid: ret.qid
                    }, function (retu, err) {
                        console.log(JSON.stringify(retu))
                        if (retu.length > 0) {//已收藏
                            zxxAudio.mcm.deleteById({
                                class: "collection",
                                id: retu[0].id
                            }, function (retud, err) {
                                if(retud){
                                    $api.removeCls($api.byId("zxx-collect"), "active");
                                    $api.text($api.byId("zxx-collect"), "收藏");
                                    showToast("取消成功");
                                }else{
                                    showToast("取消收藏失败！请检查网络连接");
                                }
                            });
                        } else {//未收藏
                            showToast("取消收藏失败！请检查网络连接");
                        }
                    });
                }
            });
        }
    } else {//未登录,去登陆
//		finishing();
        goLogin();
    }

}
/**
 * 定时
 */
zxxAudio.timing = function () {
    notification();
    showAlert("该功能尚未开放");
}

/**
 * 分享
 */
zxxAudio.share = function () {
    notification();
    loading();
    showToast("正在分享到QQ空间...");
    this.bm.send(this.bm.info(songList[this.cursor].song_id), function (ret, err) {
        var qq = api.require('qq');
        qq.shareMusic({
            url: ret.bitrate.file_link,
            title: ret.songinfo.title,
            description: ret.songinfo.author,
            imgUrl: ret.songinfo.pic_small
        });
        finishing();
    });
}

/**
 * 详情
 */
zxxAudio.detail = function () {
    notification();
    api.openFrame({
        name: modMusicDetail,
        url: "../../"+modMusicDetailURL,
        bounces: false,
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        },
        pageParam:{
            songid:songList[zxxAudio.cursor].song_id
        }
    });
}
/**
 * 返回上一层
 */
zxxAudio.goBack = function () {
    this.slider.close();
    $api.rmStorage("isModRadioDetailOpen");
    api.closeFrame();
}
/**
 * 同步
 */
zxxAudio.synchron = function () {
    if (this.isplay == 'on') {
        $($api.byId("radio-play")).removeClass().addClass('pause');
        $("#zxx-song-pic").removeClass().addClass("Rotation");
        $api.text($api.byId("zxx-song-lrc"), "正在载入歌词...");
    }
}
/**
 * 富播放器初始化方法
 */
zxxAudio.initial = function (urlcursor) {
    this.mcm = initMCM();
    this.bm = new baiduMusic();
    var nowAudio = $api.getStorage("NowAudio");
    console.log("本地播放器对象：" + JSON.stringify(nowAudio));
    this.cursor = nowAudio.cursor;//游标
    this.duration = nowAudio.duration;
    this.current = nowAudio.current;
    this.isplay = nowAudio.isplay;
    this.ispause = nowAudio.ispause;
    console.log("传入的游标："+urlcursor);
    if(urlcursor){
        this.cursor = urlcursor;
    }
    var nowSongList = $api.getStorage("localSongList");
    console.log("本地播放列表历史：" + JSON.stringify(nowSongList));
    songList = nowSongList;
    //逻辑初始化
    this.synchron();
    $api.byId("zxx-title").innerHTML = songList[this.cursor].title;
    $api.attr($api.byId("zxx-song-pic"), "src", songList[this.cursor].pic_big);
    //获取歌词数据
    this.lyric = [];
    this.getLyric();
    //初始化播放进度条
    this.slider = api.require('slider');
    this.progress = 0;
    this.zxxSlider();
    this.progressControl(this.duration,this.current,false);
    this.showCollect(songList[this.cursor].song_id);

}

/**
 * 初始化界面
 */
apiready = function () {
    loading("加载中");
    $api.setStorage("isModRadioDetailOpen", "1");
    var header = document.querySelector('header');
    $api.fixIos7Bar(header);
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    zxxAudio.initial(api.pageParam.urlcursor);
    finishing();
};
