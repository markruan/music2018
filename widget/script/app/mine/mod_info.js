var token;
var userId;
var mcm;
var tipele;
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

//密码可视化开关
function togglePasw(eleText) {
    notification()
    var input = document.querySelector('.aui-form #' + eleText);
    if (input.getAttribute("type") == "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

//表单校验
function veify() {
    var newpasw = $api.val($api.byId("newpasw"));
    var repasw = $api.val($api.byId("repasw"));
    if($api.trimAll(newpasw) == "" || $api.trimAll(repasw) == ""){
        openTips("必填项不能为空！", 3000);
    }else{
        if ($api.trimAll(newpasw) == $api.trimAll(repasw)) {
            return true;
        } else {
            openTips("两次输入的密码不一致！", 3000);
            return false;
        }
    }
}

//提交修改数据
function doUpdate() {
    notification()
    loading();
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (!token) {
        //未登录,前往登录页面
        goLogin();
    }else{
        if (veify()) {
            var user = api.require('user');
            user.updatePassword({
                password : $api.trimAll($api.val($api.byId("newpasw")))
            }, function(ret, err) {
                if (ret) {
                    finishing();
                    $api.css($api.byId("success-tip"), "display:block;");
                    setTimeout(function() {
                        api.closeFrame();
                    }, 2000);
                } else {
                    finishing();
                    openTips("未知错误,请检查网络连接状态！", 3000);
                }
            });
        } else {
            finishing();
        }
    }
}

apiready = function() {
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    var params = api.pageParam;
    mcm = initMCM();
    tipele = $api.byId("tips-1");
    if (!token) {
        //未登录,前往登录页面
        goLogin();
    }
};