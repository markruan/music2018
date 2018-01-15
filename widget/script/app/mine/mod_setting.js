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

function problem() {
    notification()
    alert("暂无内容");
}

function feedback() {
    notification()
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (token) {//登录了
        api.openFrame({
            name: "mod_feedback",
            url: "../../" + "html/mine/mod_feedback.html",
            bounces: false,
            animation: {
                type: "movein", //动画类型（详见动画类型常量）
                subType: "from_right", //动画子类型（详见动画子类型常量）
                duration: 300 //动画过渡时间，默认300毫秒
            }
        });
    } else {
        goLogin();
    }
}

function about() {
    notification()
    showAlert("作者:ischitry\n\n联系:ischitry@icloud.com\n\n版权:©2016-" + new Date().getFullYear() + " 格调云音乐 All Right is Reserved.");
}

function aboutAuthor() {
    notification();
    loading();
    api.openWin({
        name: "MOD_AUTHOR_WIN",
        url: "../../html/mine/mod_author.html",
        bounces: false,
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        }
    });
    finishing();
}

function clearCache() {
    notification()
    console.log(debug(arguments));
    loading();
    $api.rmStorage("indexHistoryHtml");
    $api.rmStorage("indexHistorySign");
    $api.rmStorage("searchHistoryList");
//			$api.clearStorage();
    finishing();
    setTimeout(function () {
        showToast("缓存清除成功")
        getCacheSize();
    }, 1000);
}

function switchIt(it) {
    notification()
    loading();
    $api.toggleCls(it, 'on');
    $api.toggleCls(it.parentNode, 'on');
    if ($api.hasCls(it, 'on')) {
        api.setPrefs({
            key: 'isAutoPlay',
            value: 'on'
        });
    } else {
        api.setPrefs({
            key: 'isAutoPlay',
            value: 'off'
        });
    }
    finishing();
}
function switchIt2(it) {
    notification()
    loading();
    $api.toggleCls(it, 'on');
    $api.toggleCls(it.parentNode, 'on');
    if ($api.hasCls(it, 'on')) {
        $api.rmStorage("isNotifyShow");
    } else {
        $api.setStorage("isNotifyShow", "1");
        var nid = $api.getStorage("NOTIFYID");
        if(nid){
            noNotify(nid);
            $api.rmStorage("NOTIFYID");
        }
    }
    finishing();
}

function checkUpdate() {
    notification()
    console.log(debug(arguments));
    loading();
    docheckUpdate();
    finishing();
}

function getCacheSize() {
    var cacheDir = api.cacheDir;
    var fs = api.require('fs');
    fs.getAttribute({
        path: cacheDir
    }, function (ret, err) {
        if (ret.status) {
            var size = parseFloat(ret.attribute.size / 1024 / 1024).toFixed(2);
            var cache = $api.dom('li.cache .cached span');
            cache.innerHTML = size;
        }
    });
}

apiready = function () {
    console.log(debug(arguments));
    $api.text($api.byId("versionT"), api.appVersion);
    getCacheSize();
    var isnotifyShow = $api.getStorage("isNotifyShow");
    if (!isnotifyShow) {
        $api.addCls($api.byId("zxxswitch2"), "on");
    }
    api.getPrefs({
        sync: false,
        key: 'isAutoPlay'
    }, function (ret, err) {
        console.log(JSON.stringify(ret))
        if ($api.trimAll(ret.value) != "") {
            $api.addCls($api.byId("zxxswitch"), ret.value);
        }
    });
};