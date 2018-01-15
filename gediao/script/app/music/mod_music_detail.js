var bm;
var mcm;
var songid;
var songObj;
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
 * 获取歌词信息
 */
function getLyric() {
    //拿到歌词数据
    bm.send(bm.lrc(songid), function (ret, err) {
        //解析歌词得到数组
        $("#zxx-lyric").html("<br/>正在加载歌词数据...");
        if (ret) {
            var lyric = parseLyrics(ret.lrcContent);
            $("#zxx-lyric").html("<br/><br/>");
            var temp = 0;
            for (var i = 0; i < lyric.length; i++) {
                var lyricOne = lyric[i].split("]")[1];
                console.log(lyricOne);
                if(lyricOne!=undefined){
                    if($api.trimAll(lyricOne) != ""){//只对前面的空行拦截
                        temp = 1;
                    }
                    if(temp == 1){
                        $("#zxx-lyric").html($("#zxx-lyric").html() + "<br/>" + lyricOne);
                    }
                }
            }
        } else {
            $("#zxx-lyric").html("<br/>歌词数据载入失败");
        }
    });
}
/**
 * 获取音乐详细数据
 * @param songid
 */
function getDetail() {
    bm.send(bm.info(songid), function (ret, err) {
        console.log(JSON.stringify(ret))
        if (ret) {
            songObj = ret;
            var songInfo = songObj.songinfo;
            // var duration = ret.bitrate.file_duration;
            // duration = parseInt(duration / 60) + "分" + parseInt(duration % 60) + "秒";
            $("#fsImg").attr("src", songInfo.pic_big);
            $("#fsInfo").html("歌曲：" + songInfo.album_title + "<br/>专辑：" + songInfo.album_title + "<br/>作者：" + songInfo.author + "<br/>");
        }
    });
}
/**
 * 当前歌曲是否已经收藏了
 */
function showCollect(){
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
            mcm.findAll({
                class: "collection",
                qid: ret.qid
            }, function (retu, err) {
                console.log(JSON.stringify(retu))
                if (retu.length > 0) {//已收藏
                    $("#zxx-collect-li").addClass("active");
                    $("#zxx-collect").text("已收藏")
                } else {//未收藏
                    $("#zxx-collect-li").removeClass("active");
                    $("#zxx-collect").text("收藏")
                }
            });
        }
    });
}
/**
 * 收藏音乐
 */
function collectRadio(ele){
    notification();
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (token) {//已登录
        //1.判断当前歌曲是否已经收藏
        if (!$api.hasCls(ele, "active")) {
            mcm.insert({
                class: 'collection',
                value: {
                    userId: userId,
                    songId: songid,
                    songTitle: songObj.songinfo.title + " - " + songObj.songinfo.author,
                }
            }, function (ret, err) {
                if (ret) {
                    $("#zxx-collect-li").addClass("active");
                    $("#zxx-collect").text("已收藏")
                    console.log(JSON.stringify(ret));
                } else {
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
                        value: songObj.songinfo.song_id
                    });
                    mcm.findAll({
                        class: "collection",
                        qid: ret.qid
                    }, function (retu, err) {
                        console.log(JSON.stringify(retu))
                        if (retu.length > 0) {//已收藏
                            mcm.deleteById({
                                class: "collection",
                                id: retu[0].id
                            }, function (retud, err) {
                                if(retud){
                                    $("#zxx-collect-li").removeClass("active");
                                    $("#zxx-collect").text("收藏")
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
        goLogin();
    }
}
/**
 * 分享音乐
 */
function shareRadio() {
    notification();
    loading();
    showToast("正在分享到QQ空间...");
    var qq = api.require('qq');
    qq.shareMusic({
        url: songObj.bitrate.file_link,
        title: songObj.songinfo.title,
        description: songObj.songinfo.author,
        imgUrl: songObj.songinfo.pic_small
    });
    finishing();
}
/**
 * 下载音乐
 */
function downRadio() {
    notification();
    var downloadManager = api.require('downloadManager');
    downloadManager.enqueue({
        url: songObj.bitrate.file_link,
        savePath: 'fs://music/' + songObj.songinfo.title + " - " + songObj.songinfo.author + ".mp3",
        cache: true,
        allowResume: true,
        title: songObj.songinfo.title + " - " + songObj.songinfo.author,
        iconPath: songObj.songinfo.pic_small,
        networkTypes: 'all'
    }, function (ret, err) {
        if (ret) {
            api.toast({
                msg: "正在下载 " + songObj.songinfo.title + " - " + songObj.songinfo.author,
                duration: 3000
            });
        } else {
            showToast(JSON.stringify(err));
        }
    });
}
/**
 * 播放音乐
 */
function playRadio(){
    notification();
    loading("加载中");
    //判断当前歌曲是否已经存在于播放列表中
    var songList = $api.getStorage("localSongList");
    var targetIndex = indexOfExtend(songList,function(arrOne){
        return (arrOne.song_id == songid);
    });
    console.log("播放音乐："+targetIndex+"|"+JSON.stringify(songObj.songinfo));
    if(targetIndex == -1){//不存在，添加后播放
        $api.setStorage("targetAddSong",songObj);
        targetIndex = songList.length;
        scriptCross('root',modMiniPlayer, 'add2SongList('+0+','+1+')');
    }else{//存在，直接播放
        $api.setStorage('targetSong',songObj.songinfo);
        scriptCross('root',modMiniPlayer, 'audio.goto()');
    }
    // scriptCross('root',modMiniPlayer, 'openFrame4RadioDetail('+1+');');
    api.openFrame({
        name: modRadioDetail,
        url: "../../" + modRadioDetailURL,
        animation: {
            type: 'movein',
            subType: "from_right"
        },
        pageParam: {
            urlcursor: targetIndex
        }
    }, function () {
        finishing();
    });
}
/**
 * 添加音乐到播放列表
 */
function addRadio(){
    notification();
    //判断当前歌曲是否已经存在于播放列表中
    var songList = $api.getStorage("localSongList");
    var targetIndex = indexOfExtend(songList,function(arrOne){
        return (arrOne.song_id == songid);
    });
    console.log("添加音乐："+targetIndex+"|"+JSON.stringify(songObj.songinfo));
    if(targetIndex == -1){
        //开始添加到播放列表的逻辑
        $api.setStorage("targetAddSong",songObj);
        scriptCross('root',modMiniPlayer, 'add2SongList()');
        showToast("成功添加到播放列表");
    }else{
        showToast("当前歌曲已在播放列表中");
    }
}

apiready = function () {
    loading();
    songid = api.pageParam.songid;
    bm = new baiduMusic();
    mcm = initMCM();
    getDetail();
    getLyric();
    showCollect();
    finishing();
    // api.setRefreshHeaderInfo({
    // 	visible : true,
    // 	loadingImg : 'widget://image/ic_ptr_pull.png',
    // 	bgColor : '#eee',
    // 	textColor : '#959595',
    // 	textDown : '下拉刷新',
    // 	textUp : '释放刷新'
    // }, function(ret, err) {
    // 	getData();
    // });
    // api.refreshHeaderLoadDone();
};