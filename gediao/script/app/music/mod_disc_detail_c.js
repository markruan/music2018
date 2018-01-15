var mcm;
var songlist = [];
var i = 0;
var type;
var sum = 10;
var offset = 0;
var page = 0;
var sign = 1;
/**
 * 显示筛选
 */
var dealStatus = 0;
function dealwith(){
    notification()
    if(dealStatus == 0){
        $(".aui-checkbox").show();
        $(".extText").css("margin-left","36px");
        dealStatus = 1;
        $("#sx-btn").text("取消");
        $(".sx-btn-ckall").show();
    }else{
        $(".aui-checkbox").hide();
        $(".extText").css("margin-left","0");
        dealStatus = 0;
        $("#sx-btn").text("筛选");
        $(".sx-btn-ckall").hide();
        $(".aui-checkbox").each(function(){
            this.checked = false;
        });
    }
}
/**
 * 全选/反选
 * @param what
 */
function doAllCheck(){
    notification()
    $(".aui-checkbox").each(function(){
        this.checked = !this.checked;
    });
}
//获取数据
function getData(fristSign) {
    loading("加载中");
    fristSign = fristSign?fristSign:0;
    bm.send(bm.list(type, sum, page), function(ret, err) {
        console.log(writeObj(ret))
        var tempSonglist = ret.song_list;
        console.log(writeObj(tempSonglist))
        if(fristSign != 0){
            $api.attr($api.byId("fsImg"), "src", tempSonglist[0].pic_big);
        }
        for (var i = 0; i < tempSonglist.length; i++) {
            var ihtml = "";
            ihtml += '<li class="onesong onesong-' + tempSonglist[i].song_id + '" tapmode="focus">';
            ihtml += '<input id="song-check-'+tempSonglist[i].song_id+'" name="song_check" class="aui-pull-left aui-checkbox aui-checkbox-primary" style="display:none;" value="'+tempSonglist[i].song_id+'" type="checkbox" onclick="notification()">';
            ihtml += '<div id="songOne-'+tempSonglist[i].song_id +'" onclick="showDetail(\'' + tempSonglist[i].song_id + '\')">' + tempSonglist[i].title + " - " + tempSonglist[i].author + '</div>';
            ihtml += '<p onclick="showDetail(\'' + tempSonglist[i].song_id + '\')">'+'<span class="extText">' + '专辑:' + tempSonglist[i].album_title + '</span>' + '<em>' + tempSonglist[i].country + ' ' +tempSonglist[i].language + '<em></p></li>';
            $("#zxx-songlist").html($("#zxx-songlist").html()+ihtml);
        }
        api.parseTapmode();
        $("#load-ing").hide();
        $("#load-btn").show();
        if(tempSonglist.length <= 0){
            sign = 0;
            $("#load-btn").text("没有更多了~");
        }else{
            songlist = merge(songlist,tempSonglist);
        }
        finishing();
    });
}
//更新当前文件索引
function showDetail(songid) {
    console.log(debug(arguments));
    api.openFrame({
        name: modMusicDetail,
        url: "../../" + modMusicDetailURL,
        bounces: false,
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        },
        pageParam: {
            songid: songid
        }
    });
}
/**
 * 获得选中的个数
 */
var checkedAry = [];
function getChecked(){
    checkedAry = [];//清空旧数据
    $(".aui-checkbox").each(function(){
        if(this.checked == true){
            checkedAry.push($(this).val());
        }
    });
    return checkedAry;
}
/**
 * 校验选中框
 */
function veifyChecked(){
    getChecked();
    console.log("选中的songid数组："+JSON.stringify(checkedAry));
    if(checkedAry.length <= 0){
        showToast("请先至少选择一项");
        dealStatus = 0;
        dealwith();
        return false;
    }else{
        return true;
    }
}
//下载当前播放的音乐文件
function downRadio() {
    notification()
    if(veifyChecked()){
        loading();
        var text = "正在批量下载 "+$("#songOne-"+checkedAry[0]).text() + " 等"+checkedAry.length+"首歌曲"
        showToast(text);
        finishing();
        showToast("下载任务创建成功,请前往下载管理界面查看");
        dealStatus = 1;
        dealwith();
        for(var i=0;i<checkedAry.length;i++){
            bm.send(bm.info(checkedAry[i]), function (ret, err) {
                console.log(JSON.stringify(ret));
                //enqueue:开始一个下载
                var downloadManager = api.require('downloadManager');
                downloadManager.enqueue({
                    url: ret.bitrate.file_link, //资源地址，不能为空
                    savePath: 'fs://music/' + ret.songinfo.title + " - " + ret.songinfo.author + ".mp3", //存储路径，为空时使用自动创建的路径
                    cache: true, //是否使用缓存
                    allowResume: true, //是否开启断点续传，需要服务器支持
                    title: ret.songinfo.title + " - " + ret.songinfo.author, //展示在managerView列表中的文件标题
                    iconPath: ret.songinfo.pic_small, //该项下载显示在 managerView 中对应的图标
                    networkTypes: 'all'//允许自动下载的网络环境，参考网络环境常量
                }, function (ret, err) {
                    // if (ret) {
                    //     api.toast({
                    //         msg: "正在下载 " + ret.title + " - " + ret.author,
                    //         duration: 3000
                    //     });
                    // } else {
                    //     alert(JSON.stringify(err));
                    // }
                });
            });
        }
    }
}
//播放
function playRadio() {
    notification()
    if(veifyChecked()){
        //先检查当前需要添加到播放列表中的歌曲与原始播放列表的重叠情况，并生成一个待添加的播放列表
        var songList = $api.getStorage("localSongList");//拿到旧数组
        var checkAry = getByIndex(songlist,checkedAry);//拿到新数组
        mergeDefined(checkAry,songList,function(sign,targetAry){
            //即将要播放的歌曲游标
            console.log("播放音乐："+JSON.stringify(checkAry));
            console.log("播放音乐："+JSON.stringify(targetAry));
            if(targetAry.length > 0){//目标数组不为空,先添加后播放(播放选中的第一首)
                $api.setStorage("targetAddSong",targetAry);
                scriptFrame(modMiniPlayer, 'add2SongList('+1+','+1+','+sign+')');
                showToast("成功添加到播放列表");
            }else{//目标数组为空,直接播放当前选中的第一首歌曲
                $api.setStorage('targetSong',targetAry[0]);
                scriptFrame(modMiniPlayer, 'audio.goto()');
            }
            scriptFrame(modMiniPlayer, 'openFrame4RadioDetail('+1+');');
        });//获得目标数组   ------- [直接使用merge方法时,songList与checkAry内部结构不一样,达不到预期目的]
    }
}
//添加
function addRadio(){
    notification()
    if(veifyChecked()){
        //先检查当前需要添加到播放列表中的歌曲与原始播放列表的重叠情况，并生成一个待添加的播放列表
        var songList = $api.getStorage("localSongList");//拿到旧数组
        var checkAry = getByIndex(songlist,checkedAry);//拿到新数组
        var targetAry = mergeDefined(checkAry,songList);//获得目标数组   ------- [直接使用merge方法时,songList与checkAry内部结构不一样,达不到预期目的]
        console.log("添加音乐："+checkAry.length +"|"+ +targetAry.length);
        console.log("添加音乐："+JSON.stringify(checkAry));
        console.log("添加音乐："+JSON.stringify(targetAry));
        if(targetAry.length > 0){
            //开始添加到播放列表的逻辑
            $api.setStorage("targetAddSong",targetAry);
            scriptFrame(modMiniPlayer, 'add2SongList('+1+')');
            showToast("成功添加到播放列表");
        }else{
            showToast("选中歌曲均已在播放列表中");
        }
    }
}
//加载更多
function loadMore(){
    notification()
    console.log("加载更多...");
    $("#load-btn").hide();
    $("#load-ing").show();
    //开始加载...
    offset += 1;
    page = parseInt(offset)*10;
    if(sign == 1){
        dealStatus = 1;
        dealwith();
        getData();
    }
}
/**
 * 初始化界面
 */
apiready = function () {
    bm = new baiduMusic();
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    type = api.pageParam.typeid;
    console.log(type)
    var listname = listName(parseInt(type));
    $api.text($api.byId("bangdan"), listname);
    getData(1);
    mcm = initMCM();
};