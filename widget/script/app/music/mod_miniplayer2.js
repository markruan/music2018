/**
 * Created by chitry@126.com on 2017/5/20.
 */
var netAudio; //netAudio网路音频功能模块对象
var bm; //百度音乐API对象

//歌曲列表对象，存储的是Array对象
var songList = new Array();
var songListId;//对应当前用户的云端播放列表数据列id
var temp = 0;//临时存储容器
/**
 * 批量将从百度音乐API接口获取到的榜单数据转化为音乐列表数据
 * @param bangdanList
 */
songList.bangdan2SongList = function (bangdanList) {
    for (var i = 0; i < bangdanList.length; i++) {//遍历榜单数据，并开始转化
        //歌曲对象，此对象为合并简易对象，同时包含榜单对象和歌曲对象中的字段(兼容)
        var song = new Object();
        song.song_id = bangdanList[i].song_id;//歌曲id
        song.song_source = bangdanList[i].song_source;//歌曲来源
        song.title = bangdanList[i].title;//歌曲名称
        song.lrclink = bangdanList[i].lrclink;//歌词链接地址
        song.artist_id = bangdanList[i].artist_id;//作者id
        song.author = bangdanList[i].author;//作者名称
        song.album_id = bangdanList[i].album_id;//专辑id
        song.album_title = bangdanList[i].album_title;//专辑名称
        song.pic_small = bangdanList[i].pic_small;//缩略图
        song.pic_big = bangdanList[i].pic_big;//大图
        song.file_duration = bangdanList[i].file_duration;//时长
        song.all_rate = bangdanList[i].all_rate;//支持码率
        this[i] = song;
    }
}
//播放器对象
var audio = new Object();
/**
 * 初始化播放器对象
 */
audio.initial = function () {
    //构造参数初始化
    this.cursor = 0;//游标
    this.duration = 0;
    this.current = 0;
    this.isplay = "off";
    this.ispause = "0";
    $api.setStorage('NowSongCursor', 0);
    $api.setStorage("NowAudio", this);
}
/**
 * 真正的播放方法
 */
audio.realplay = function () {
    var tempSong = songList[audio.cursor];//拿到当前游标指向的歌曲对象
    bm.send(bm.info(tempSong.song_id), function (ret, err) {
        if(ret){
            console.log(ret);
            /**
             * 存储到最近收听
             */
            api.setPrefs({
                key: 'nearListenId',
                value: tempSong.song_id
            });
            api.setPrefs({
                key: 'nearListenInfo',
                value: tempSong.title + " - " + tempSong.author
            });
            scriptCross('root',tabMine,"nearListen()");
            var token = $api.getStorage("loginToken");
            var userId = $api.getStorage("loginUserId");
            if (token && audio.ispause == '0') {//登录了 && 没有暂停过
                var mcm = initMCM();
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
                            value: tempSong.song_id
                        });
                        mcm.findAll({
                            class: "listenHistory",
                            qid: ret.qid
                        }, function (retu, err) {
                            console.log(JSON.stringify(retu))
                            if (retu.length > 0) {//有匹配数据,更新云端计数器
                                mcm.updateById({
                                    class: 'listenHistory',
                                    id: retu[0].id,
                                    value: {
                                        num: parseInt(retu[0].num + 1)
                                    }
                                });
                            } else {//无匹配数据,新增
                                mcm.insert({
                                    class: 'listenHistory',
                                    value: {
                                        userId: userId,
                                        songId: tempSong.song_id,
                                        songTitle: tempSong.title + " - " + tempSong.author,
                                        num: 1
                                    }
                                });
                            }
                        });
                    } else {
                        alert("未知错误,请检查网络连接状态！");
                    }
                });
            }
            //存储数据以供外部调用
            $api.setStorage("NowSongCursor", audio.cursor);
            $api.setStorage("NowSongInfo", ret.songinfo);
            //重置时长指示器
            audio.duration = 0;
            audio.current = 0;
            netAudio.play({
                path: ret.bitrate.file_link
            }, function (nret, err) {
                if (nret) {
                    $("#radio-play").removeClass().addClass('pause');
                    $api.byId('radio-info').innerHTML = tempSong.title + " - " + tempSong.author;
                    if (nret.complete) {//播放完了,自动下一曲
                        audio.ispause = "0";
                        audio.next();
                    }
                    audio.duration = nret.duration; //播放时长监控显示
                    audio.current = nret.current; //音频总时长，单位为s
                    //当前播放位置，单位为s
                    var tempDuration = parseInt(audio.duration);
                    var tempCurrent = parseInt(audio.current);
                    var tempProgress = parseInt(Math.round(tempCurrent / tempDuration * 10000) / 100);
                    $api.css($api.byId('radio-progress'), "width: " + tempProgress + "%;");
                    //存储播放器对象
                    // console.log(JSON.stringify(audio));
                    $api.setStorage("NowAudio", audio);
                    //这里需要监听目标Frame是否存在,否则会报运行时异常
                    var iszai = $api.getStorage("isModRadioDetailOpen");
                    if (iszai) {
                        var radioDetailWhere = $api.getStorage("whereModRadioDetail");
                        if(radioDetailWhere){
                            scriptCross(radioDetailWhere,modRadioDetail, 'zxxAudio.progressControl(' + audio.cursor + ',"' + audio.duration + '","' + audio.current + '","' + nret.complete + '");');
                        }else{
                            scriptFrame(modRadioDetail, 'zxxAudio.progressControl(' + audio.cursor + ',"' + audio.duration + '","' + audio.current + '","' + nret.complete + '");');
                        }
                    }
                    var ttfdur = parseInt(audio.duration / 60);
                    ttfdur = (ttfdur < 10) ? "0" + ttfdur : ttfdur;
                    var ttmdur = parseInt(audio.duration % 60);
                    ttmdur = (ttmdur < 10) ? "0" + ttmdur : ttmdur;
                    var ttfcur = parseInt(audio.current / 60);
                    ttfcur = (ttfcur < 10) ? "0" + ttfcur : ttfcur;
                    var ttmcur = parseInt(audio.current % 60);
                    ttmcur = (ttmcur < 10) ? "0" + ttmcur : ttmcur;
                    var isnotifyShow = $api.getStorage("isNotifyShow");
                    if(!isnotifyShow){
                        var notifyId = notify(tempSong.title + " - " + tempSong.author,ttfcur + ":" + ttmcur+" / "+ttfdur + ":" + ttmdur,'0');
                        $api.setStorage("NOTIFYID",notifyId);
                    }
                    //播放过程中,实时把播放进度传给需要的页面
                }
            });
        }else{
            netAudio.pause();
            audio.isplay = "off";
            audio.ispause = "1";
            audio.duration = 0;
            audio.current = 0;
            $api.setStorage("NowAudio", audio);
            $api.byId('radio-info').innerHTML = "网络错误...";
            showToast("数据获取失败,请检查网络连接...");
        }
    });
}
/**
 * 控制跳转到指定位置播放
 */
audio.controlprogess = function(value){
    netAudio.setProgress({//跳转播放位置：（可选项）播放位置百分比，取值范围：0-100(默认0)
        progress: parseInt(value)
    });
}
/**
 * 控制播放或者暂停
 * @param iswhat
 */
audio.controlplay = function(iswhat){
    console.log(debug(arguments));
    iswhat = iswhat?iswhat:"on";
    var it = $api.byId("radio-play");
    if (songList.length > 0) {
        if (iswhat == "on") {
            $(it).removeClass().addClass('buffer');
            audio.isplay = "on";
            setTimeout(function () {
                audio.realplay();
            }, 300);
        } else {
            $api.byId('radio-info').innerHTML = songList[audio.cursor].title + " - " + songList[audio.cursor].author;
            $(it).removeClass().addClass('play');
            audio.isplay = "off";
            audio.ispause = "1";
            netAudio.pause();
        }
    } else {
        netAudio.pause();
        audio.isplay = "off";
        audio.ispause = "1";
        audio.duration = 0;
        audio.current = 0;
        $api.byId('radio-info').innerHTML = "请先添加歌曲...";
        showToast("播放列表为空,请先添加歌曲");
    }
    $api.setStorage("NowSongCursor", audio.cursor);
    $api.setStorage("NowAudio", audio);
}
/**
 * 播放和暂停
 * @param it
 */
audio.play = function (it) {
    console.log(debug(arguments));
    it = it?it:$api.byId("radio-play");
    if (songList.length > 0) {
        if ($(it).hasClass('pause')) {
            $(it).removeClass().addClass('play');
            audio.isplay = "off";
            audio.ispause = "1";
            netAudio.pause();
        } else {
            $(it).removeClass().addClass('buffer');
            audio.isplay = "on";
            setTimeout(function () {
                audio.realplay();
            }, 300);
        }
    } else {
        netAudio.pause();
        audio.isplay = "off";
        audio.ispause = "1";
        audio.duration = 0;
        audio.current = 0;
        $api.byId('radio-info').innerHTML = "请先添加歌曲...";
        showToast("播放列表为空,请先添加歌曲");
    }
    $api.setStorage("NowAudio", audio);

}
/**
 * 播放下一首
 */
audio.next = function () {
    console.log(debug(arguments));
    if (songList.length > 0) {
        audio.ispause = "0";
        audio.cursor++;
        if (audio.cursor > songList.length-1) {//当最后一首播放完之后,重新播放第一首
            audio.cursor = 0;
        }
        $api.setStorage("NowSongCursor", audio.cursor);
        netAudio.stop();
        var it = $api.byId("radio-play");
        if ($(it).hasClass('play')) {//暂停状态
            $api.byId('radio-info').innerHTML = songList[audio.cursor].title + " - " + songList[audio.cursor].author;
        } else {
            $(it).removeClass().addClass('buffer');
            $api.byId('radio-info').innerHTML = "正在载入...";
            audio.realplay();
        }
        scriptFrame(modRadioList, 'nextFocus();');

    } else {
        netAudio.pause();
        audio.isplay = "off";
        audio.ispause = "1";
        audio.duration = 0;
        audio.current = 0;
        $api.byId('radio-info').innerHTML = "请先添加歌曲...";
        showToast("播放列表为空,请先添加歌曲");
    }
    $api.setStorage("NowAudio", audio);
}

/**
 * 播放上一首
 */
audio.prev = function () {
    console.log(debug(arguments));
    if (songList.length > 0) {
        audio.ispause = "0";
        audio.cursor--;
        if (audio.cursor <= 0) {
            audio.cursor = 0;
        }
        $api.setStorage("NowSongCursor", audio.cursor);
        netAudio.stop();
        var it = $api.byId("radio-play");
        if ($(it).hasClass('play')) {//暂停状态
            $api.byId('radio-info').innerHTML = songList[audio.cursor].title + " - " + songList[audio.cursor].author;
        } else {
            $api.byId('radio-info').innerHTML = "正在载入...";
            audio.realplay();
        }
        scriptFrame(modRadioList, 'prevFocus();');

    } else {
        netAudio.pause();
        audio.isplay = "off";
        audio.ispause = "1";
        audio.duration = 0;
        audio.current = 0;
        $api.byId('radio-info').innerHTML = "请先添加歌曲...";
        showToast("播放列表为空,请先添加歌曲");
    }
    $api.setStorage("NowAudio", audio);
}




//////////////////////////////////////////////////////////
///////////////////  外部调用模块  ////////////////////////
//////////////////////////////////////////////////////////
/**
 * 直接跳转到某一首播放
 */
audio.goto = function () {
    var targetSong = $api.getStorage('targetSong');
    console.log(JSON.stringify(songList))
    audio.cursor = indexOfExtend(songList,function(arrOne){
        return (arrOne.song_id == targetSong.song_id);
    });
    console.log("audio.goto:"+audio.cursor+"|"+JSON.stringify(targetSong));
    $api.setStorage("NowSongCursor", audio.cursor);
    $api.setStorage("NowAudio", audio);
    netAudio.stop();
    var it = $api.byId("radio-play");
    $api.byId('radio-info').innerHTML = songList[audio.cursor].title + " - " + songList[audio.cursor].author;
    $(it).removeClass().addClass('buffer');
    audio.isplay = "on";
    setTimeout(function () {
        audio.realplay();
    }, 300);

}
/**
 * 更新本地缓存和云端的播放列表数据
 */
function update4SongList(){
    console.log(debug(arguments));
    //更新本地缓存
    $api.setStorage('localSongList', songList);
    var oldSongList  = $api.getStorage('oldLocalSongList');
    if(oldSongList){
        if(oldSongList.length != songList.length){
            temp = 1;
        }
    }
    //判断songList是否发生变更
    if(temp == '1'){
        //更新云端
        var userId = isLogin($api);
        var mcm = initMCM();
        if (userId) {//登录了
            showToast("正在同步数据...");
            var query = api.require('query');
            query.createQuery(function (ret, err) {
                if (ret) {
                    query.whereEqual({
                        qid: ret.qid,
                        column: 'userId',
                        value: userId
                    });
                    mcm.findAll({
                        class: "songList",
                        qid: ret.qid
                    }, function (retu, err) {
                        console.log(JSON.stringify(retu))
                        if (retu.length > 0) {//有匹配数据,更新云端计数器
                            mcm.updateById({
                                class: 'songList',
                                id: retu.id,
                                value: {
                                    songs: songList
                                }
                            },function(ret,err){
                                if(ret){
                                    showToast("数据已成功同步到云端");
                                }else{
                                    showToast("同步失败，请检查网络连接")
                                }
                            });
                        } else {//无匹配数据,新增
                            mcm.insert({
                                class: 'songList',
                                value: {
                                    userId: userId,
                                    songs: songList
                                }
                            }, function (ret, err) {
                                if(ret){
                                    showToast("数据已成功同步到云端");
                                }else{
                                    showToast("同步失败，请检查网络连接")
                                }
                            });
                        }
                    });
                } else {
                    alert("同步失败，请检查网络连接");
                }
            });
        }
    }
}
/**
 * 从播放列表中删除指定节点
 */
function removeOne4songList(callback) {
    console.log(debug(arguments));
    var targetRemoveSong = $api.getStorage("targetRemoveSong");//要删除的目标歌曲对象
    console.log("perv："+JSON.stringify(songList));
    var targetIndex = indexOfExtend(songList,function(arrOne){
        return (arrOne.song_id == targetRemoveSong.song_id);
    });
    var tempSong = songList[audio.cursor];
    songList.splice(targetIndex, 1);
    console.log("after："+JSON.stringify(songList));
    temp = "1";//播放列表是否变更
    $api.setStorage('localSongList', songList);
    $api.setStorage('NowSongCursor', audio.cursor);
    update4SongList();
    //控制播放：删除的不是当前歌曲,不走
    if(tempSong.song_id == targetRemoveSong.song_id){
        if (audio.cursor > songList.length-1) {//当最后一首播放完之后,重新播放第一首
            audio.cursor = 0;
        }
        audio.controlplay(audio.isplay);
    }
    $api.setStorage('NowSongCursor',audio.cursor);
    $api.setStorage("NowAudio", audio);
    var iszai = $api.getStorage("isModRadioDetailOpen");
    if (iszai) {
        var radioDetailWhere = $api.getStorage("whereModRadioDetail");
        if(radioDetailWhere){
            scriptCross(radioDetailWhere,modRadioDetail, 'zxxAudio.updateView()');
        }else{
            scriptFrame(modRadioDetail, 'zxxAudio.updateView()');
        }
    }
    if(songList.length <= 0){
        var nid = $api.getStorage("NOTIFYID");
        if(nid){
            noNotify(nid);
            $api.rmStorage("NOTIFYID");
        }
    }
    callback();
}
/**
 * 清空播放列表
 */
function removeAll4songList(callback) {
    console.log(debug(arguments));
    songList.splice(0, songList.length);
    temp = "1";//播放列表是否变更
    netAudio.stop();
    audio.isplay = "off";
    audio.ispause = "1";
    audio.duration = 0;
    audio.current = 0;
    $api.css($api.byId('radio-progress'), "width: 0%;");
    $api.setStorage('localSongList', songList);
    $api.setStorage('NowSongCursor', -1);
    update4SongList();
    audio.controlplay(audio.isplay);
    $api.setStorage('NowSongCursor',audio.cursor);
    $api.setStorage("NowAudio", audio);
    var iszai = $api.getStorage("isModRadioDetailOpen");
    if (iszai) {
        var radioDetailWhere = $api.getStorage("whereModRadioDetail");
        if(radioDetailWhere){
            scriptCross(radioDetailWhere,modRadioDetail, 'zxxAudio.updateView()');
        }else{
            scriptFrame(modRadioDetail, 'zxxAudio.updateView()');
        }
    }
    var nid = $api.getStorage("NOTIFYID");
    if(nid){
        noNotify(nid);
        $api.rmStorage("NOTIFYID");
    }

    callback();
}
/**
 * 脚本控制播放和暂停,给需要的页面调用
 * @param action
 */
function playRadioControl(action) {
    var it = $api.byId("radio-play");
    if (action == "pause") {//暂停
        $(it).removeClass().addClass('pause');
    } else {
        $(it).removeClass().addClass('play');
    }
    audio.play(it);
}
/**
 * 格式化将要添加入播放列表的歌曲数组数据
 * @param songAry 歌曲数组
 * @param sign 单条添加或数组添加
 */
function format2NewSongAry(songAry,sign){
        var formatSong = new Object();
        formatSong.song_id = songAry.songinfo.song_id;//歌曲id
        formatSong.song_source = songAry.songinfo.song_source;//歌曲来源
        formatSong.title = songAry.songinfo.title;//歌曲名称
        formatSong.lrclink = songAry.songinfo.lrclink;//歌词链接地址
        formatSong.artist_id = songAry.songinfo.artist_id;//作者id
        formatSong.author = songAry.songinfo.author;//作者名称
        formatSong.album_id = songAry.songinfo.album_id;//专辑id
        formatSong.album_title = songAry.songinfo.album_title;//专辑名称
        formatSong.pic_small = songAry.songinfo.pic_small;//缩略图
        formatSong.pic_big = songAry.songinfo.pic_big;//大图
        formatSong.file_duration = songAry.bitrate.file_duration;//时长
        formatSong.all_rate = songAry.songinfo.all_rate;//支持码率
        return formatSong;
}
/**
 * 增加播放列表数据(提供给其他脚本使用)
 * @param Obj 歌曲对象(可以是数组)
 * @param sign 说明是单个对象还是数组对象
 * @param isRunNow 是否立即开始播放
 */
function add2SongList(sign, isRunNow, targetCursor) {
    var Obj = $api.getStorage("targetAddSong");
    isRunNow = isRunNow?isRunNow:0;//默认不播放
    sign = sign?sign:0;//默认单条
    songList = $api.getStorage("localSongList");
    var targetSongs;
    var tempSign = songList.length;//记录住最后一个位置的游标
    targetCursor = targetCursor?targetCursor:0;//默认单条
    console.log("更新播放列表:" +targetCursor+"|"+tempSign+"|"+ isRunNow+ "|" +JSON.stringify(Obj) );
    if(sign == 0){
        targetSongs = format2NewSongAry(Obj,sign);
        songList.splice(tempSign, 0, targetSongs);
    }else{
        //合并数组
        // songList = mergeDefined2(Obj,songList);
        songList = Obj;
    }
    //默认添加到最后一个位置(不放到第一个位置是因为防止游标逻辑的复杂化)
    console.log("添加后："+JSON.stringify(songList[tempSign]));
    console.log("添加后："+songList[tempSign].title);
    update4SongList();
    if(isRunNow == 1){
        if(targetCursor == 0 && sign == 0){
            audio.cursor = tempSign;
        }else{
            audio.cursor = targetCursor;
        }
        console.log(audio.cursor);
        updateView4SongList(audio.cursor);
        $api.setStorage('NowSongCursor',audio.cursor);
        $api.setStorage("NowAudio", audio);
        audio.controlplay();
    }else{
        updateView4SongList(audio.cursor);
        $api.setStorage('NowSongCursor',audio.cursor);
        $api.setStorage("NowAudio", audio);
    }

}







//////////////////////////////////////////////////////////
///////////////////  内部功能模块  ////////////////////////
//////////////////////////////////////////////////////////

/**
 * 获取songList
 * 形参为：从本地缓存中读取的歌曲列表数据
 * 此处包含的操作有：将本地缓存中的播放列表直接返回或者读取APICloud数据云上的用户播放列表数据
 */
function getSongList(localSongList, callback) {
    //检查回调函数是否可用调用的
    if (typeof callback !== 'function') {
        callback = false;
    }
    //开始业务逻辑
    if (localSongList) {//若本地缓存中的songList数据不为空，则直接存储该songList
        console.log("本地缓存中的songList数据不为空，则直接存储该songList")
        songList = localSongList;
        callback();//回调
    } else {//若本地缓存中的songList为空，则读取APICloud数据云中的songList
        console.log("本地缓存中的songList为空，则读取APICloud数据云中的songList")
        var token = $api.getStorage("loginToken");
        var userId = $api.getStorage("loginUserId");
        if (userId) {//登录了
            api.ajax({
                url: 'https://d.apicloud.com/mcm/api/songList?filter[order]=updateAt DESC&filter[where][userId]=' + userId,
                dataType: 'json',
                type: "GET",
                headers: {
                    'X-APICloud-AppId': appid,
                    'X-APICloud-AppKey': hashAppKey
                }
            }, function (ret, err) {
                console.log(JSON.stringify(ret));
                if (ret) {//若APICloud数据云中的songList存在，则直接存储该songList
                    //缓存到本地
                    songList = ret.songs;
                    $api.setStorage('localSongList', songList);
                    callback();//回调
                } else {//若APICloud数据云中的songList不存在，则请求百度音乐API获取第一排行榜数据的10首歌曲
                    var showGuide = $api.getStorage('showGuide');
                    if (showGuide) {
                    }else{
                        $api.setStorage('showGuide','1');//告诉系统,引导页走过了
                        console.log("APICloud数据云中的songList不存在，则请求百度音乐API获取第一排行榜数据的10首歌曲")
                        //获取热歌榜单的前10首歌
                        bm.send(bm.list(1, 10, 0), function (ret, err) {
                            console.log(writeObj(ret))
                            songList.bangdan2SongList(ret.song_list);
                            console.log(writeObj(songList));
                            //存储到本地缓存
                            $api.setStorage('localSongList', songList);
                            //同步到云端
                            update4SongList();
                        });
                    }
                }
            });
        } else {//未登录，则请求百度音乐API获取第一排行榜数据的10首歌曲
            var showGuide = $api.getStorage('showGuide');
            if (showGuide) {
            }else{
                $api.setStorage('showGuide','1');//告诉系统,引导页走过了
                console.log("未登录，则请求百度音乐API获取第一排行榜数据的10首歌曲")
                //获取热歌榜单的前10首歌
                bm.send(bm.list(1, 10, 0), function (ret, err) {
                    console.log(writeObj(ret))
                    songList.bangdan2SongList(ret.song_list);
                    console.log(writeObj(songList));
                    //存储到本地缓存
                    $api.setStorage('localSongList', songList);
                    callback();//回调
                });
            }
        }
    }
}
/**
 * 更新songList的前端展示
 */
function updateView4SongList(j) {
    j = j?j:0;
    if (songList) {
        if (songList.length <= 0) {
            netAudio.pause();
            audio.isplay = "off";
            audio.ispause = "1";
            audio.duration = 0;
            audio.current = 0;
            $api.byId('radio-info').innerHTML = "请先添加歌曲...";
            showToast("播放列表为空,请先添加歌曲");
        } else {
            $api.byId('radio-info').innerHTML = songList[j].title + " - " + songList[j].author;
        }
    } else {
        netAudio.pause();
        audio.isplay = "off";
        audio.ispause = "1";
        audio.duration = 0;
        audio.current = 0;
        $api.byId('radio-info').innerHTML = "网络错误...";
        showToast("数据获取失败,请检查网络连接...");
    }
    finishing();
}
/**
 * 打开播放列表
 */
function openFrame4RadioList() {
    notification();
    console.log(debug(arguments));
    if (songList.length >= 0) {
        loading("加载中");
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
                    h: height
                }
            });
        } else {//打开了
            scriptFrame(modRadioList, 'closeThis();');
        }
        finishing();
    } else {
        showToast("参数非法！");
    }
}

//音频详细:打开页面,传递相关播放数据,目标页面不实现播放功能(仅仅只是假的播放效果,具体还是本Frame播放音乐)
function openFrame4RadioDetail(outdo) {
    console.log(debug(arguments));
    if (songList == undefined || songList.length > 0) {
        loading("加载中");
        api.openFrame({
            name: modRadioDetail,
            url: "../../" + modRadioDetailURL,
            animation: {
                type: 'movein',
                subType: "from_right"
            }
        }, function () {
            finishing();
        });
        outdo = outdo?outdo:0;
        if(outdo == 1){
            //调整该播放器界面到最前面
            api.bringFrameToFront({
                from: modRadioDetail,
            });
        }
    } else {
        showToast("播放列表为空,请先添加歌曲");
    }
}
/**
 * 自动播放控制
 */
function autoPlay(){
    //是否开启自动播放
    var isAutoPlay = api.getPrefs({
        sync: true,
        key: 'isAutoPlay'
    });
    if (isAutoPlay == 'on') {
        $api.byId("radio-play").click();
    }
}

/**
 * 初始化界面
 */
apiready = function () {
    // $api.clearStorage();
    loading("加载中");
    console.log(debug(arguments));

    //清空额外标记参数
    $api.rmStorage('isRadiolistFrameOpen');//播放列表Frame是否展开标记

    //初始化播放器对象
    audio.initial();

    //申请netAudio模块
    netAudio = api.require('netAudio');

    //申请百度音乐接口对象
    bm = new baiduMusic();

    //获取songList中的数据,并更新前端展示
    getSongList($api.getStorage("localSongList"), function () {
        updateView4SongList();
        autoPlay();
    });
    finishing();
}