/**
 * 数据云封装
 * 需要依赖 api.js, sha.js(用于加密)
 */

//云API
var host = "https://d.apicloud.com";
var appid = 'A6947399513900', appkey = 'C9DEA65B-51D1-E5B7-C6BE-A07FF3051FA0';
var now = Date.now();
var hashStr = appid + 'UZ' + appkey + 'UZ' + now;
var shaObj = new jsSHA(hashStr, "TEXT");
var hashAppKey = shaObj.getHash("SHA-1", "HEX");
hashAppKey = hashAppKey + '.' + now;

/**
 *初始化MCM组件(仅在apiready之后调用)
 */
function initMCM() {
    var mcm = api.require('model');
    //在线编译正式版时，可以不用配置,APICloud会取当前应用的配置
    mcm.config({
        appId: appid,
        appKey: appkey,
        url: host
    });
    return mcm;
}


//前往登录
function goLogin(api) {
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
 * 判断是否登录，如果已经登录
 * 参数：$api对象和需要返回的数据(默认返回userId)
 */
function isLogin($api,what) {
    token = $api.getStorage("loginToken");
    userId = $api.getStorage("loginUserId");
    if (!token) {//未登录,前往登录页面
        return false;
    } else {//登录了，返回userId
        if (!what || what == "userId") {
            return userId;
        } else {
            return token;
        }
    }
}

/**
 * 登录
 */
function login(username, password) {
    initMCM();
    var user = api.require("user");
    user.login({
        username: username,
        password: password
    }, function (ret, err) {
        console.log("ret: " + JSON.stringify(ret) + "\nerr: " + JSON.stringify(err));
    });
}