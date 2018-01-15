var token;
var userId;
var mcm;
var tipele;
var hids = [];
/**
 * 打开提示层
 */
var tipAn;
function openTips(tiptext, time) {
    tiptext = (tiptext == undefined) ? "提示信息" : tiptext;
    time = (time == undefined) ? "none" : time;
    $api.text($api.byId("tip-text"), tiptext);
    $api.removeCls(tipele, "slideOutUp");
    $api.addCls(tipele, "slideInDown");
    $api.css(tipele, "display:block;");
    if (time != 'none') {
        clearTimeout(tipAn);
        tipAn = setTimeout("closeTips()", time);
    }
}

/**
 * 关闭提示层
 */
function closeTips() {
    notification()
    $api.removeCls(tipele, "slideInDown");
    $api.addCls(tipele, "slideOutUp");
    //	$api.css(tipele,"display:none;");
}

//前往登录
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
 * 清除历史记录 ,删除数据云API存在问题,暂时不支持
 */
function clearHistory() {
    notification()
    api.confirm({
        title: '警告',
        msg: '确认清除所有的收听历史记录吗？',
        buttons: ['确定', '取消']
    }, function (ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            loading();
            var temp = 0;
            for (var i = 0; i < hids.length; i++) {
                console.log(hids[i])
                mcm.deleteById({
                    class: "listenHistory",
                    id: hids[i]
                }, function (retu, err) {
                    console.log(JSON.stringify(retu));
                    console.log(JSON.stringify(err));
                    if(retu){
                        api.removePrefs({
                            key: 'nearListenInfo'
                        });
                        scriptCross('root',tabMine,"nearListen()");
                        $api.text($api.byId("topic"),"收听历史");
                        if(temp ==0) {
                            showToast("操作成功！");
                            temp = 1;
                        }
                        loadPage();
                    }else{
                        showToast("操作失败！请检查网络连接")
                    }
                });
            }
            finishing();
        }
    });
}

function showDetail(songid){
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

function loadPage(){
    loading("加载中")
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    mcm = initMCM();
    tipele = $api.byId("tips-1");
    if (!token) {
        //未登录,前往登录页面
        finishing();
        goLogin();
    } else {//开始读取云端数据
        api.ajax({
            url: 'https://d.apicloud.com/mcm/api/listenHistory?filter[order]=updateAt DESC&filter[where][userId]=' + userId,
            dataType: 'json',
            type: "GET",
            headers: {
                'X-APICloud-AppId': appid,
                'X-APICloud-AppKey': hashAppKey
            }
        }, function (ret, err) {
            console.log(JSON.stringify(ret));
            if (ret) {
                var i = 0, len = ret.length;
                var htmlStr = '';
                for (i; i < len; i++) {
                    var item = ret[i];
                    hids.push(item.id);
                    console.log(JSON.stringify(item));
                    htmlStr += '<li class="aui-list-view-cell" onclick="showDetail(\''+item.songId+'\')">' + item.songTitle + '</li>';
                }
                console.log(hids);
                if(htmlStr != ''){
                    $api.text($api.byId("topic"),"收听历史("+len+")");
                    $api.css($api.byId('msgtip'), "display:none;");
                }else{
                    $api.css($api.byId('msgtip'), "display:block;");
                }
                $api.byId('listenlist').innerHTML = htmlStr;
            } else {
                $api.byId('listenlist').innerHTML = "";
                $api.css($api.byId('msgtip'), "display:block;");
            }
            finishing();
        });
    }
}

apiready = function () {
    loadPage();
};