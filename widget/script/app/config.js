/**
 * 页面对象相关配置
 *
 * 注:有些页面的js引入,涉及uri的问题需要针对宿主页面进行相对路径偏移处理！
 */
var tabMine = "tab_mine";
var tabMineURL = "html/mine/mod_mine.html";
var tabSearch = "tab_search";
var tabSearchURL = "html/search/mod_search.html";
var tabWinSearch = "mod_win_search";
var tabWinSearchURL = "html/search/mod_win_search.html";
var tabDiscover = "tab_discover";
var tabDiscoverURL = "html/discover/mod_discover.html";
var tabGroupDownload = "tab_download";
var tabDownloaded = tabGroupDownload + "ed";
var tabDownloadedURL = "html/download/mod_downloaded.html";
var tabDownloading = tabGroupDownload + "ing";
var tabDownloadingURL = "html/download/mod_downloading.html";

var modGuide = "mod_guide";
var modGuideURL = "html/guide/mod_guide.html";
var modMiniPlayer = "mod_miniplayer";
var modMiniPlayerURL = "html/music/mod_miniplayer.html";
var modCategory = "mod_category";
var modCategoryURL = "html/discover/mod_category.html";
var modExit = "exit";
var modExitURL = "html/exit.html";

var modWinDiscDetail = "mod_win_disc_detail";
var modWinDiscDetailURL = "html/music/mod_win_disc_detail.html";
var modWinMusicDetail = "mod_win_music_detail";
var modWinMusicDetailURL = "html/music/mod_win_music_detail.html";
var modRadioList = "mod_radiolist";
var modRadioListURL = "html/music/mod_radiolist.html";
var modRadioDetail = "mod_radio_detail";
var modRadioDetailURL = "html/music/mod_radio_detail.html";
var modDiscDetailC = "mod_disc_detail_c";
var modDiscDetailCURL = "html/music/mod_disc_detail_c.html";
var modDiscDetailH = "mod_disc_detail_h";
var modDiscDetailHURL = "html/music/mod_disc_detail_h.html";
var modMusicDetail = "mod_music_detail";
var modMusicDetailURL = "html/music/mod_music_detail.html";

var modSearchRes = "mod_search_res";
var modSearchResURL = "html/search/mod_search_res.html";

var modMineLogin = "mod_mine_login";
var modMineLoginURL = "html/mine/mod_login.html";
var modWinSetting = "mod_win_setting";
var modWinSettingURL = "html/mine/mod_win_setting.html";
var modSetting = "mod_setting";
var modSettingURL = "html/mine/mod_setting.html";

var modDownload = "mod_download";
var tabList = [tabMine, tabDiscover, modDownload, tabSearch];
//tab列表,按实际顺序

/**
 * 如果当前函数是有名函数，则返回其名字，如果是匿名函数则返回被赋值的函数变量名，如果是闭包中匿名函数则返回“anonymous”
 * 使用：在要调查的函数内部执行此函数，传入一个参数，为arguments.callee。
 * function  ee(){
 //+++++++++++++++++++++++++++++++++
 var fnname =getFnName(arguments.callee)
 //+++++++++++++++++++++++++++++++++
 alert(fnname)
 };
 ee();
 */
var getFnName = function (callee) {
    var _callee = callee.toString().replace(/[\s\?]*/g, ""), comb = _callee.length >= 50 ? 50 : _callee.length;
    _callee = _callee.substring(0, comb);
    var name = _callee.match(/^function([^\(]+?)\(/);
    if (name && name[1]) {
        return name[1];
    }
    var caller = callee.caller;
    if (!caller) {//caller为空,无法获取
        return "anonymous";
    }
    var _caller = caller.toString().replace(/[\s\?]*/g, "");
    var last = _caller.indexOf(_callee), str = _caller.substring(last - 30, last);
    name = str.match(/var([^\=]+?)\=/);
    if (name && name[1]) {
        return name[1];
    }
    return "anonymous"
};

/**
 * 自定义debug日志监控,level来控制输出的日志级别
 *
 * 调用: console.log(debug(arguments));
 *
 * 当前已经定义的级别：
 *                        core 系统核心级别
 *                        data 数据云级别
 *                        service 业务逻辑级别
 *                        third 第三方服务级别
 *
 */
var debug = function (arguments, level) {
    level = (level == undefined) ? "core" : level;
    //不输出的级别
    var noOut = "core,third";
    if (noOut.length > 0) {
        if (noOut.indexOf(level) > -1) {
            return "";
        }
    }
    //得到方法名称
    var FnName = getFnName(arguments.callee);
    //得到参数
    var Params = "";
    for (var i = 0; i < arguments.length; i++) {
        Params += arguments[i] + ", ";
    }
    //开始输出日志信息
    var LL = "未知";
    switch (level) {
        case "core":
            LL = "系统核心";
            break;
        case "data":
            LL = "数据云";
            break;
        case "service":
            LL = "业务逻辑";
            break;
        case "third":
            LL = "第三方服务";
            break;
    }

    return "[" + LL + "级别] 方法:" + FnName + " 参数:" + Params + "  ";

};

/**
 * 获取js对象信息
 * @param {Object} obj
 */
function writeObj(obj) {
    var description = "";
    for (var i in obj) {
        var property = obj[i];
        description += i + " = " + property + "\n";
    }
    return description;
}

/**
 * js对象转字符串
 * @param {Object} o
 */
function obj2string(o) {
    var r = [];
    if (typeof o == "string") {
        return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
    }
    if (typeof o == "object") {
        if (!o.sort) {
            for (var i in o) {
                r.push(i + ":" + obj2string(o[i]));
            }
            if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
                r.push("toString:" + o.toString.toString());
            }
            r = "{" + r.join() + "}";
        } else {
            for (var i = 0; i < o.length; i++) {
                r.push(obj2string(o[i]))
            }
            r = "[" + r.join() + "]";
        }
        return r;
    }
    return o.toString();
}

/**
 * 在 frame 中执行脚本，对于 frameGroup 里面的 frame 也有效
 * 若 name 和 frameName 都未指定，则在当前 window 中执行脚本
 *
 * 参数：
 * frameName：frame名称
 * script：js代码
 *
 * 使用示例：scriptFrame("myFrame","hello();");
 */
function scriptFrame(fName, jsfun) {
    // console.log("在Frame:" + fName + "中执行脚本：" + jsfun);
    api.execScript({
        frameName: fName,
        script: jsfun
    });
}

/**
 * 在指定 window 中执行脚本
 * 若 name 和 frameName 都未指定，则在当前 window 中执行脚本
 *
 * 参数：
 * name：window 名称，若要跨 window 执行脚本，该字段必须指定，首页的名称为 root
 * script：js代码
 *
 * 使用示例：scriptWindow("myWindow","hello();");
 */
function scriptWindow(wName, jsfun) {
    console.log("在Window:" + wName + "中执行脚本：" + jsfun);
    api.execScript({
        name: wName,
        script: jsfun
    });
}

function scriptCross(wName, fName, jsfun) {
    console.log("在Window:" + wName + "中的Frame:" + fName + "中执行脚本：" + jsfun);
    api.execScript({
        name: wName,
        frameName: fName,
        script: jsfun
    });
}

function tabDirection(nowIndex, targetIndex) {
    if (nowIndex >= 0 && nowIndex < tabList.length && targetIndex >= 0 && targetIndex < tabList.length) {//合法性判断
        if (nowIndex > targetIndex) {//目标tab在当前tab左边
            return "left";
        } else {
            return "right";
        }
    }
}

/**
 * 首页Tab扫动切换逻辑
 * (写在这里是因为只能在tab中调用,在首页直接调用无效)
 * @param {Object} index 当前tab索引(0~3)
 */
function swipeTab(index, only) {
    $api.setStorage("swipeIndex",index);
    scriptCross('root',"mod_download","getData()");
    scriptCross('root',tabMine,"nearListen()");
//	if (index >= 0 && index < tabList.length) {
//		only = (only == undefined) ? "all" : only;
//		var rightTarget = "none";
//		if ((index - 1) >= 0 && (only == 'all' || only == 'right')) {
//			rightTarget = tabList[index - 1];
//			//向右轻扫
//			api.addEventListener({
//				name : 'swiperight'
//			}, function(ret, err) {
//				console.log(ret)
//				console.log('向右轻扫');
//				scriptWindow("root", "openTab('" + rightTarget + "','" + (index - 1) + "',true);");
//			});
//		}
//		var leftTarget = "none";
//		if ((index + 1) <= tabList.length && (only == 'all' || only == 'left')) {
//			leftTarget = tabList[index + 1];
//			//向左轻扫
//			api.addEventListener({
//				name : 'swipeleft'
//			}, function(ret, err) {
//				console.log('向左轻扫');
//				scriptWindow("root", "openTab('" + leftTarget + "','" + (index + 1) + "',true);");
//			});
//		}
//	}
}

/**
 * 日期类型拓展
 * @param {Object} fmt
 */
Date.prototype.pattern = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}


function loading(title, msg) {
    title = title ? title : '处理中';
    msg = msg ? msg : '';
    api.showProgress({
        title: title,
        text: msg,
        modal: false
    });
}

function finishing() {
    api.hideProgress();
}

function showAlert(msg) {
    api.alert({
        title: '提示',
        msg: msg
    });
}
var timer;
function showToast(msg) {
    timer && clearTimeout(timer);
    timer = setTimeout(function() {
        api.toast({
            msg: msg,
            duration: 2000,//（可选项）持续时长，单位：毫秒
            global: false,//（可选项）是否是全局的toast。若为false，toast将只在当前window范围可见；若为true，安卓手机上面弹出的位置将会固定在底部区域。(默认false)
            location: 'bottom'//（可选项）弹出位置，顶部(top)、中间(middle)或底部(bottom)
        });
    }, 2000);
}
//提示音
function notification(){
    api.startPlay({
        path : 'widget://res/btn.mp3'
    });
}

function value(id) {
    return document.getElementById(id).value;
}

//判断object/json是否为空的。
function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}
//返回元素在数组中的位置(复杂的数组不建议使用)
function indexOf(arr, item) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === item)
            return i;
    }
    return -1;
}
//按照条件判断返回元素在数组中的位置(推荐使用该方法)
function indexOfExtend(arr, callback) {
    for (var i = 0; i < arr.length; i++) {
        if (callback(arr[i]))
            return i;
    }
    return -1;
}
//根据指定的元素指定的索引批量获取元素
function getByIndex(arr, indexArr, callback) {
    var eArr = [];
    var k = 0;
    for (var i = 0; i < indexArr.length; i++) {
        for (var j = 0; j < arr.length; j++) {
            if (indexArr[i] == arr[j].song_id) {
                console.log(arr[j].title)
                eArr[k] = arr[j];
                k++;
            }
        }
    }
    return eArr;
}
//自定义去重合并数组(将原始数组中出现的目标重新排序，接在后面)
//Arr1：目标数组
//Arr2：原始数组
function mergeDefined(arr1, arr2,callback) {
    var eArr = [];
    var k = 0;
    var sign = 0;
    for (var i = 0; i < arr1.length; i++) {
        // var sign = 1;
        // for (var j = 0; j < arr2.length; j++) {
        //     if (arr1[i].song_id == arr2[j].song_id) {
        //         sign = 0;
        //     }
        // }
        // if (sign == 1) {
        //     console.log(arr1[i].title)
        //     eArr[k] = arr1[i];
        //     k++;
        // }
        for (var j = 0; j < arr2.length; j++) {
            if (arr1[i].song_id == arr2[j].song_id) {
                arr2.splice(j,1);
            }
        }
    }
    for(var a = 0;a<arr2.length;a++){
        eArr[k] = arr2[a];
        k++;
    }
    sign = arr2.length;
    for(var b=0;b<arr1.length;b++){
        eArr[k] = arr1[b];
        k++;
    }
    console.log("自定义去重合并："+sign+"|"+eArr.length+"|"+JSON.stringify(eArr))
    if(callback != undefined)
        callback(sign,eArr);
    return eArr;
}
function mergeDefined2(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        arr2.push(arr1[i]);
    }
    return arr2;
}
//合并数组并去重(数组结构必须相同)
function merge(arr1, arr2) {
    var arr = arr1.concat(arr2);
    var lastArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (!unique(arr[i], lastArr)) {
            lastArr.push(arr[i]);
        }
    }
    return lastArr;
}
//判断指定元素在数组中是否存在
function unique(n, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (n == arr[i]) {
            return true;
        }
    }
    return false;
}

//状态栏歌曲播放监听
function notify(title,content,extra,updateCurrent){
    updateCurrent = updateCurrent?updateCurrent:true;
    api.notification({
        sound:'',
        notify: {
            title:title,                //标题，默认值为应用名称，只Android有效
            content:content,               //内容，默认值为'有新消息'
            extra:extra,                  //传递给通知的数据，在通知被点击后，该数据将通过监听函数回调给网页
            updateCurrent: updateCurrent    //是否覆盖更新已有的通知，取值范围true|false。只Android有效
        }
    }, function(ret, err) {
        return ret.id;
    });
}

function noNotify(notifyId){
    api.cancelNotification({
        id: -1
    });
}


function docheckUpdate(sign){
    sign = sign?sign:0;
    if(sign == 0){//关闭手动更新
        showToast("已是最新版本");
    }else{
        var mam = api.require('mam');
        mam.checkUpdate(function(ret, err) {
            if (ret) {
                console.log("checkUpdate:"+JSON.stringify(ret));
                if(ret.msg == 'invalid request.'){
                    if(sign != 0){
                        showToast("已是最新版本")
                    }
                }else{
                    var result = ret.result;
                    if (result.update == true && result.closed == false) {
                        var str = '新版本型号:' + result.version + ';更新日志:' + result.updateTip + ';下载地址:' + result.source + ';发布时间:' + result.time;
                        api.confirm({
                            title : '有新的版本,是否下载并安装 ',
                            msg : str,
                            buttons : ['确定', '取消']
                        }, function(ret, err) {
                            if (ret.buttonIndex == 1) {
                                if (api.systemType == "android") {
                                    api.download({
                                        url : result.source,
                                        report : true
                                    }, function(ret, err) {
                                        if (ret && 0 == ret.state) {/* 下载进度 */
                                            api.toast({
                                                msg : "正在下载应用" + ret.percent + "%",
                                                duration : 2000
                                            });
                                        }
                                        if (ret && 1 == ret.state) {/* 下载完成 */
                                            var savePath = ret.savePath;
                                            api.installApp({
                                                appUri : savePath
                                            });
                                        }
                                    });
                                }
                                if (api.systemType == "ios") {
                                    api.installApp({
                                        appUri : result.source
                                    });
                                }
                            }
                        });
                    } else {
                        api.alert({
                            msg : "已经是最新版本"
                        });
                    }
                }
            } else {
                api.alert({
                    msg : err.msg
                });
            }
        });
    }
}