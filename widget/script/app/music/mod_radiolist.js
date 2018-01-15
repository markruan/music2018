var songList;
var tempSongList;
var songCursor;//游标
var tempCursor;//临时游标
var isedit = 0;//编辑状态标记
var istongbu = 0;//同步状态标记
var num = 0;//计数器
var focusSongId;

/**
 * 关闭当前窗口(健壮处理)
 */
function closeThis() {
    notification();
    $('#radio-list').removeClass('in');
    if(istongbu == '0'){
        updateSongList();//更新播放列表
    }
    setTimeout(function () {
        api.closeFrame();
        $api.rmStorage('isRadiolistFrameOpen');
    }, 350);
}

/**
 * 锁定下一首歌曲(供外部调用)
 */
function nextFocus() {
    $("#zxxcontent").find("li").each(function () {
        $(this).removeClass();
        $(this).addClass("songli");
    })
    songCursor++;
    if (songCursor > songList.length-1) {
        songCursor = 0;
    }
    $("#song_" + tempSongList[songCursor].song_id).addClass("active");
//	api.animation({
//	     translation: {
//	        x: 0,
//	        y: -100,
//	        z: 0
//	    },
//  },function(ret,err){
//  	console.log("动画结束")
//  });
}

/**
 * 锁定上一首歌曲(供外部调用)
 */
function prevFocus() {
    $("#zxxcontent").find("li").each(function () {
        $(this).removeClass();
        $(this).addClass("songli");
    })
    songCursor--;
    if (songCursor <= 0) {
        songCursor = 0;
    }
    $("#song_" + tempSongList[songCursor].song_id).addClass("active");
}

/**
 * 锁定指定歌曲(活动调用)
 * @param j
 */
function oneFocus(j) {
    console.log("onwFocus:"+j);
    songCursor = j;
    $("#zxxcontent").find("li").each(function () {
        $(this).removeClass();
        $(this).addClass("songli");
    })
    if (songCursor < 0) {
        showToast("非法游标...");
        songCursor = 0;
    }
    $("#song_" + tempSongList[songCursor].song_id).addClass("active");
}

/**
 * 锁定指定歌曲(活动调用),通过传入id
 * @param j
 */
function oneFocusById(songid) {
    console.log("oneFocusById:"+songid)
    $("#zxxcontent").find("li").each(function () {
        $(this).removeClass();
        $(this).addClass("songli");
    });
    $("#song_" + songid).addClass("active");
}

/**
 * 取得当前锁定的歌曲ID
 */
function getFocusSongId(){
    $("#zxxcontent").find("li").each(function () {
        if($(this).hasClass("active")){
            focusSongId = $(this).attr("id").split("_")[1];
            console.log("取得当前锁定的歌曲ID:"+focusSongId);
        }
    });
}

/**
 * 请求处理
 */
function dealwith() {
    notification();
    isedit = 1;
    //显示出删除按钮
    $('.songli').css({
        'background': 'url(../../image/ic_item_delete_s.png) no-repeat 96% center;',
        '-webkit-background-size': '17px;',
        'background-size': '17px;'
    });
    //显示出编辑完成按钮和清空按钮
    $(".zxx-edit").css("display", "none;");
    $(".zxx-deal").css("display", "inline-block;");
}

/**
 * 处理完成
 */
function dealend() {
    notification();
    isedit = 0;
    //显示出删除按钮
    $('.songli').css({
        'background': 'url(../../image/ic_arrow_general.png) no-repeat 96% center;',
        '-webkit-background-size': '18px;',
        'background-size': '18px;'
    });
    //显示出编辑完成按钮和清空按钮
    $(".zxx-edit").css("display", "inline-block;");
    $(".zxx-deal").css("display", "none;");
    //更新播放列表
    updateSongList();
}

/**
 * 删除指定的
 * @param j
 */
function remove(tempSong){
    notification();
    var targetIndex = indexOfExtend(songList,function(arrOne){
        return (arrOne.song_id == tempSong.song_id);
    });
    //前端展示删除
    if(songList.length<=0){
        $api.css($api.byId("zxxtip"), 'display:block;');
        $(".zxx-btn").hide();
    }else{
        var tempSongOri = songList[targetIndex];
        songList.splice(targetIndex, 1);//开始删除
        //更新播放列表
        $api.setStorage('targetRemoveSong',tempSong);
        scriptCross('root',modMiniPlayer, "removeOne4songList("+function() {songList = $api.getStorage('localSongList');}+")");
        songCursor = $api.getStorage('NowSongCursor');
        //删除的是当前锁定的歌曲，删除后自动转到下一首,同时将锁定歌曲进行变更
        getFocusSongId();
        console.log("FOCUS:"+focusSongId);
        console.log("REMOVE:"+focusSongId+"|"+JSON.stringify(tempSong));
        if(focusSongId == tempSong.song_id){
            console.log("删除后自动转到下一首:"+targetIndex+"|"+tempSong.title);
            if (targetIndex > songList.length-1) {//当最后一首播放完之后,重新播放第一首
                targetIndex = 0;
            }
            oneFocusById(songList[targetIndex].song_id);
        }
        $("#radio-list-title").html("播放列表 ("+(--num)+")");
        $("#song_" + tempSong.song_id).hide();
    }
}

/**
 * 清空播放列表
 */
function removeAll() {
    notification();
    $api.byId("zxxcontent").innerHTML = "";
    $api.css($api.byId("zxxtip"), 'display:block;');
    $(".zxx-btn").hide();
    songList.splice(0, songList.length);
    scriptCross('root',modMiniPlayer, "removeAll4songList("+function() {songList = $api.getStorage('localSongList');
            songCursor = $api.getStorage('NowSongCursor');}+")");
    $("#radio-list-title").html("播放列表 (0)");
}
/**
 * 更新播放列表
 */
function updateSongList(){
    istongbu = 1;
    scriptCross('root',modMiniPlayer, "update4SongList()");
}

/**
 * 切歌/删除(调用外部Frame)
 * @param j
 */
function go2Song(j) {
    notification();
    console.log("go2Song:"+j+"|"+JSON.stringify(tempSongList[j]));
    if (isedit == 0) {//切歌
        $api.setStorage('targetSong',tempSongList[j]);
        scriptCross('root',modMiniPlayer, "audio.goto()");
        oneFocus(j);
    } else {//删除
        console.log(j)
        remove(tempSongList[j]);
    }

}

/**
 * 初始化界面
 */
apiready = function () {
    console.log(debug(arguments));
    songList = $api.getStorage('localSongList');
    tempSongList = $api.getStorage('localSongList');
    $api.setStorage('oldLocalSongList',songList);
    num = tempSongList.length;
    songCursor = $api.getStorage('NowSongCursor');
    tempCursor = $api.getStorage('NowSongCursor');
    focusSongId = songCursor;
    console.log(songList + "|" + songCursor);
    $("#radio-list-title").html("播放列表 ("+songList.length+")");
    var ihtml = "";
    for (var i = 0; i < songList.length; i++) {
        if (songCursor == i) {
            ihtml += "<li id='song_" + songList[i].song_id + "' rel='"+i+"' class='songli active' tapmode='focus' onclick='go2Song(\"" + i + "\")'>";
        } else {
            ihtml += "<li id='song_" + songList[i].song_id + "' rel='"+i+"' class='songli' tapmode='focus' onclick='go2Song(\"" + i + "\")'>";
        }
        var duration = songList[i].file_duration;
        duration = parseInt(duration / 60) + "分" + parseInt(duration % 60) + "秒";
        ihtml += "<div><p>&nbsp;&nbsp;" + songList[i].title + " - " + songList[i].author + "</p><label>&nbsp;&nbsp;&nbsp;时长: " + duration + "</label></div>";
        ihtml += "</li>"
    }
    if(songList.length<=0){
        $api.css($api.byId("zxxtip"), 'display:block;');
        $(".zxx-btn").hide();
    }
    $api.byId("zxxcontent").innerHTML = ihtml;
    console.log(ihtml);
    //对窗口的处理
    var $list = $('#radio-list');
    $list.addClass('in');
    $(document.body).on('touchend', function (evt) {
        if (!$.contains($list[0], evt.target)) {
            var isRadiolistFrameOpen = $api.getStorage('isRadiolistFrameOpen');
            console.log(isRadiolistFrameOpen)
            if (isRadiolistFrameOpen == 'true') {//打开了
                console.log(isRadiolistFrameOpen)
                $api.setStorage('isRadiolistFrameOpen', 'false');
                closeThis();
            }
        }
    });
}; 