var mcm;
var token;
var userId;
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

function setting() {
    notification()
    console.log(debug(arguments));
    api.openWin({
        name : modWinSetting,
        url : "../../" + modWinSettingURL,
        animation : {
            type : 'movein',
            subType : 'from_right'
        },
        bgColor:'#EEE'
    });
}

/**
 * 点击头像之后的操作
 */
function clickHeadPic() {
    notification()
    token = $api.getStorage("loginToken");
    if (token) {
        // myInfo();
    } else {
        goLogin();
    }
}

function goLogin() {
    api.openFrame({
        name : modMineLogin,
        url : "../../" + modMineLoginURL,
        bounces : false,
        animation : {
            type : "movein", //动画类型（详见动画类型常量）
            subType : "from_right", //动画子类型（详见动画子类型常量）
            duration : 300 //动画过渡时间，默认300毫秒
        }
    });
}

//我的收藏
function myCollect() {
    notification()
    token = $api.getStorage("loginToken");
    if (token) {
        api.openFrame({
            name : "mod_collect",
            url : "../../" + "html/mine/mod_collect.html",
            bounces : false,
            animation : {
                type : "movein", //动画类型（详见动画类型常量）
                subType : "from_right", //动画子类型（详见动画子类型常量）
                duration : 300 //动画过渡时间，默认300毫秒
            }
        });
    } else {//未登录,先登录
        goLogin();
    }
}

//最近收听
function myListen() {
    notification()
    token = $api.getStorage("loginToken");
    if (token) {
        api.openFrame({
            name : "mod_listen",
            url : "../../" + "html/mine/mod_listen.html",
            bounces : false,
            animation : {
                type : "movein", //动画类型（详见动画类型常量）
                subType : "from_right", //动画子类型（详见动画子类型常量）
                duration : 300 //动画过渡时间，默认300毫秒
            }
        });
    } else {//未登录,先登录
        goLogin();
    }
}

//我的资料
function myInfo() {
    notification()
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (token) {//登录了
        api.openFrame({
            name: "mod_info",
            url: "../../" + "html/mine/mod_info.html",
            bounces: false,
            animation: {
                type: "movein", //动画类型（详见动画类型常量）
                subType: "from_right", //动画子类型（详见动画子类型常量）
                duration: 300 //动画过渡时间，默认300毫秒
            }
        });
    }else{
        goLogin();
    }
}

/**
 * 退出登录
 */
function logout() {
    notification()
    api.pageUp();
    loading();
    var user = api.require("user");
    user.logout({
        token : token
    }, function(ret, err) {
        if (ret) {
            $api.rmStorage("loginToken");
            $api.rmStorage("loginUserId");
            finishing();
            $api.css($api.byId("success-tip"), "display:block;");
            updateDate();
            setTimeout(function() {
                $api.css($api.byId("success-tip"), "display:none;");
            }, 1000);
        } else {
            var tip = "未知错误,请检查网络连接状态！";
            switch(err.status) {
            }
            finishing();
            openTips(tip, 3000);
        }
    });
}

/**
 * 更新数据
 */
function updateDate() {
    loading("数据同步中");
    //判断是否登录了
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (token) {//登录了
        $api.css($api.byId("logoutBtn"), "display:block;");
        var query = api.require('query');
        query.createQuery(function(ret, err) {
            if (ret) {
                query.whereEqual({
                    qid : ret.qid,
                    column : 'userId',
                    value : userId
                });
                mcm.findAll({
                    class : "userInfo",
                    qid : ret.qid
                }, function(retu, err) {
                    console.log(JSON.stringify(retu));
                    console.log(retu[0].headpic);
                    var headpic = "../../image/headpic/default.jpg";
                    if (retu[0].headpic)
                        headpic = retu[0].headpic;
                    $api.attr($api.byId("login-headpic"), "src", headpic);
                    $api.text($api.byId("login-name"), retu[0].nickname);
                });
            } else {
                var tip = "未知错误,请检查网络连接状态！";
                openTips(tip, 3000);
            }
        });
    } else {//未登录
        $api.css($api.byId("logoutBtn"), "display:none;");
        $api.attr($api.byId("login-headpic"), "src", "../../image/userinfo_avatar.png");
        $api.text($api.byId("login-name"), "请点击头像登录");
    }
    finishing();
}

function nearListen(){
    //最近收听的音乐
    var nearMusic = api.getPrefs({
        sync : true,
        key : 'nearListenInfo'
    });
    if (nearMusic)
        $api.text($api.byId("nearTitle"), nearMusic);
}

apiready = function() {
    console.log(debug(arguments));
    mcm = initMCM();
    nearListen();
    updateDate();
    swipeTab(0);
};