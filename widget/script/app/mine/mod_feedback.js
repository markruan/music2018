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
    $api.removeCls(tipele, "slideInDown");
    $api.addCls(tipele, "slideOutUp");
    //	$api.css(tipele,"display:none;");
}

function hideTip(){
    notification()
    $api.css($api.byId("feedb-tip"), 'display:none');
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

//清除默认内容
function clearText(ele) {
    var val = $api.trimAll($api.val(ele));
    if (val == "来，不服打一架...") {
        ele.value = "";
    }
}

//提交反馈数据
function doFeedback() {
    notification()
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (!token) {
        //未登录,前往登录页面
        goLogin();
    }else{
        loading("正在提交");
        var content = $api.val($api.byId("fb-content"));
        if ($api.trimAll(content) != "" && $api.trimAll(content) != "来，不服打一架...") {
            mcm.insert({
                class : 'feedBack',
                value : {
                    userId : userId,
                    content : content
                }
            }, function(ret, err) {
                finishing();
                if (ret) {
                    console.log(JSON.stringify(ret));
                    $api.css($api.byId("success-tip"),"display:block;");
                    setTimeout(function(){
                        api.closeFrame();
                    },2000);
                } else {
                    openTips("未知错误,请检查你的网络连接",3000);
                }
            });
        }else{
            finishing();
            openTips("请输入反馈内容！",3000);
        }
    }
}

apiready = function() {
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    var params = api.pageParam;
    var fbContent = params.fbContent;
    if(fbContent)
        $api.byId("fb-content").value = fbContent;
    mcm = initMCM();
    tipele = $api.byId("tips-1");
    if (!token) {
        //未登录,前往登录页面
        goLogin();
    }
};