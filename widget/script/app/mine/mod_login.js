var mcm;
var tipele;

function goReg(){
    api.openFrame({
        name : "MOD_MINE_REG",
        url : "../../html/mine/mod_register.html",
        bounces : false,
        animation : {
            type : "movein", //动画类型（详见动画类型常量）
            subType : "from_right", //动画子类型（详见动画子类型常量）
            duration : 300 //动画过渡时间，默认300毫秒
        }
    });
}

//清空用户名输入
function delname() {
    notification()
	var input = document.querySelector('.aui-form #loginname');
	input.value = '';
}

//密码可视化开关
function togglePasw() {
    notification()
	var input = document.querySelector('.aui-form #loginpasw');
	if (input.getAttribute("type") == "password") {
		input.type = "text";
	} else {
		input.type = "password";
	}
}

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

/**
 * 校验表单合法性
 */
function verify(username, password) {
	if (username == "") {
		openTips("用户名不能为空！", 3000);
		return false;
	}
	if (password == "") {
		openTips("密码不能为空！", 3000);
		return false;
	}
	return true;
}

/**
 * 登录
 */
function doLogin(uname, pasw) {
	loading("正在登录");
	var username = uname ? uname : $api.trimAll(value("loginname"));
	var password = pasw ? pasw : $api.trimAll(value("loginpasw"));
	if (verify(username, password)) {
		var user = api.require("user");
		user.login({
			username : username,
			password : password
		}, function(ret, err) {
			if (ret) {
				finishing();
				$api.setStorage("loginToken", ret.id);
				$api.setStorage("loginUserId", ret.userId);
				$api.css($api.byId("success-tip"), "display:block;");
                showToast("正在同步数据...");
                var songList = $api.getStorage("localSongList");
                var query = api.require('query');
                query.createQuery(function (ret, err) {
                    if (ret) {
                        query.whereEqual({
                            qid: ret.qid,
                            column: 'userId',
                            value: ret.userId
                        });
                        mcm.findAll({
                            class: "songList",
                            qid: ret.qid
                        }, function (retu, err) {
                            console.log(JSON.stringify(retu))
                            if (retu.length > 0) {//有匹配数据,更新云端计数器
                                mcm.updateById({
                                    class: 'songList',
                                    id: retu.id,
                                    value: {
                                        songs: songList
                                    }
                                },function(ret,err){
                                    if(ret){
                                        showToast("数据已成功同步到云端");
                                    }else{
                                        showToast("同步失败，请检查网络连接")
                                    }
                                });
                            } else {//无匹配数据,新增
                                mcm.insert({
                                    class: 'songList',
                                    value: {
                                        userId: ret.userId,
                                        songs: songList
                                    }
                                }, function (ret, err) {
                                    if(ret){
                                        showToast("数据已成功同步到云端");
                                    }else{
                                        showToast("同步失败，请检查网络连接")
                                    }
                                });
                            }
                        });
                    } else {
                        showToast("同步失败，请检查网络连接");
                    }
                });
				setTimeout(function() {
					scriptFrame(tabMine, "updateDate()");
					api.closeFrame();
				}, 2000);
			} else {//错误情况
				var tip = "未知错误,请检查网络连接状态！";
				switch(err.status) {
					case 401:
						tip = "登录失败,用户名或密码错误！";
				}
				finishing();
				openTips(tip, 3000);
			}
			console.log("ret: " + JSON.stringify(ret) + "\nerr: " + JSON.stringify(err));
		});
	} else {
		finishing();
		return false;
	}

}

/**
 * QQ登录
 */
function doQQLogin() {
	loading("调起QQ程序中")
	var qq = api.require('qq');
	qq.login(function(ret, err) {
		//	    api.alert({
		//	        title: 'id和token',
		//	        msg: ret.openId + ret.accessToken
		//	    });
		//

		//获取qq第三方信息
		//  {
		//		status: true           //布尔类型；操作成功状态值
		//  	info:                  //JSON对象；包含用户信息描述，内部字段如下：
		// city ：用户所在城市
		// figureurl  ：空间小头像（30）地址
		// figureurl_1  ：空间中头像（50）地址
		// figureurl_2  ：空间大头像（100）地址
		// figureurl_qq_1  ：用户小头像（40）地址
		// figureurl_qq_2   ：用户大头像（100）地址
		// gender        ：用户性别
		// is_yellow_vip  ：是否为黄钻用户
		// level         ：用户账号级别
		// nickname  ：用户昵称
		// province    ：用户所在省份

		// yellow_vip_level   ：用户账户黄钻等级
		//     }
		//判断是否已经注册
		loading("校验信息")
		qq.getUserInfo(function(retu, err2) {
			console.log("获取qq用户信息：" + JSON.stringify(retu));
			var query = api.require('query');
			query.createQuery(function(ret, err) {
				if (ret) {
					query.whereEqual({
						qid : ret.qid,
						column : 'nickname',
						value : retu.info.nickname
					});
					query.whereEqual({
						qid : ret.qid,
						column : 'province',
						value : retu.info.province
					});
					query.whereEqual({
						qid : ret.qid,
						column : 'city',
						value : retu.info.city
					});
					query.whereEqual({
						qid : ret.qid,
						column : 'sex',
						value : retu.info.gender
					});
					query.whereEqual({
						qid : ret.qid,
						column : 'headpic',
						value : retu.info.figureurl_qq_2
					});
					mcm.findAll({
						class : "userInfo",
						qid : ret.qid
					}, function(retus, err) {
						if (retus.length > 0) {//已注册->直接登录
							finishing();
							doLogin('qq-' + retu.info.nickname, '123456');
						} else {//未注册,先注册,再登陆
							loading("正在注册")
							var user = api.require("user");
							var mydate = new Date();
							user.register({
								username : 'qq-' + retu.info.nickname,
								password : '123456',
								email : 'qq-' + mydate.getTime() + '@qq.com'
							}, function(ret, err1) {
								console.log("使用qq第三方信息注册:" + JSON.stringify(ret))
								if (ret) {
									loading("收集信息")
									mcm.insert({
										class : 'userInfo',
										value : {
											userId : ret.id,
											nickname : retu.info.nickname,
											province : retu.info.province,
											city : retu.info.city,
											sex : retu.info.gender,
											type : 'qq',
											headpic : retu.info.figureurl_qq_2
										}
									}, function(retuu, err3) {
										console.log("注册副表信息:" + JSON.stringify(retuu) + "| ERR:" + JSON.stringify(err3));
										if (retuu) {
											//开始登录
											finishing();
											doLogin('qq-' + retu.info.nickname, '123456');
										} else {
											finishing();
											alert("登录失败！");
										}
									});
								} else {
									finishing();
									alert("注册失败,请检查网络连接！");
								}
							});
						}
					});
				}
			});
		});
	});
}

/**
 * 微信第三方登录
 */
function doWxLogin(){
	showToast("当前应用在微信开放平台的审核尚未通过");
    var wx = api.require('wx');
    wx.isInstalled(function(ret, err) {
        if (ret.installed) {
        	//开始授权
            wx.auth({
                apiKey: ''
            }, function(ret, err) {
                if (ret.status) {
                    console.log(JSON.stringify(ret));
                    //获取AccessToken
                    wx.getToken({
                        apiKey: '',
                        apiSecret: '',
                        code: ret.code
                    }, function(ret, err) {
                        if (ret.status) {
                        	//获取用户信息
                            wx.getUserInfo({
                                accessToken: ret.accessToken,
                                openId: ret.openId
                            }, function(ret, err) {
                                if (ret.status) {
                                    //开始登录和注册逻辑：若为注册，则先注册
                                    var query = api.require('query');
                                    query.createQuery(function(retq, err) {
                                        if (retq) {
                                            query.whereEqual({
                                                qid : retq.qid,
                                                column : 'nickname',
                                                value : ret.nickname
                                            });
                                            query.whereEqual({
                                                qid : retq.qid,
                                                column : 'sex',
                                                value : ret.sex
                                            });
                                            query.whereEqual({
                                                qid : retq.qid,
                                                column : 'headpic',
                                                value : ret.headimgurl
                                            });
                                            query.whereEqual({
                                                qid : retq.qid,
                                                column : 'wx_openid',
                                                value : ret.openid
                                            });
                                            query.whereEqual({
                                                qid : retq.qid,
                                                column : 'wx_unionid',
                                                value : ret.unionid
                                            });
                                            mcm.findAll({
                                                class : "userInfo",
                                                qid : retq.qid
                                            }, function(retus, err) {
                                                if (retus.length > 0) {//已注册->直接登录
                                                    finishing();
                                                    doLogin('wx-' + ret.nickname, '123456');
                                                } else {//未注册,先注册,再登陆
                                                    loading("正在注册");
                                                    var user = api.require("user");
                                                    var mydate = new Date();
                                                    user.register({
                                                        username : 'qq-' + ret.nickname,
                                                        password : '123456',
                                                        email : 'wx-' + mydate.getTime() + '@wx.com'
                                                    }, function(retr, err1) {
                                                        console.log("使用微信第三方信息注册:" + JSON.stringify(retr))
                                                        if (retr) {
                                                            loading("收集信息")
                                                            mcm.insert({
                                                                class : 'userInfo',
                                                                value : {
                                                                    userId : retr.id,
                                                                    nickname : ret.nickname,
                                                                    sex : ret.sex,
                                                                    type : 'wx',
                                                                    wx_openid:ret.openid,
                                                                    wx_unionid:ret.unionid,
                                                                    headpic : ret.headimgurl
                                                                }
                                                            }, function(retuu, err3) {
                                                                console.log("注册副表信息:" + JSON.stringify(retuu) + "| ERR:" + JSON.stringify(err3));
                                                                if (retuu) {
                                                                    //开始登录
                                                                    finishing();
                                                                    doLogin('wx-' + retu.info.nickname, '123456');
                                                                } else {
                                                                    finishing();
                                                                    alert("登录失败！");
                                                                }
                                                            });
                                                        } else {
                                                            finishing();
                                                            alert("注册失败,请检查网络连接！");
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    var txt = "当前应用在微信开放平台的审核尚未通过";
                                    switch(err.code){
                                        case -1:txt = "未知错误";break;
                                        case 0:txt = "成功,但授权失败";break;
                                        case 1:txt = "accessToken 过期";break;
                                        case 2:txt = "openId非法";break;
                                        case 3:txt = "openId值为空";break;
                                        case 4:txt = "accessToken值为空";break;
                                        case 4:txt = "accessToken非法";break;
                                        case 4:txt = "网络超时";break;
                                    }
                                    showToast(txt);
                                }
                            });
                        } else {
                            var txt = "当前应用在微信开放平台的审核尚未通过";
                            switch(err.code){
                                case -1:txt = "未知错误";break;
                                case 0:txt = "成功,但授权失败";break;
                                case 1:txt = "apiKey值为空或非法";break;
                                case 2:txt = "apiSecret值为空或非法";break;
                                case 3:txt = "code值为空或非法";break;
                                case 4:txt = "网络超时";break;
                            }
                            showToast(txt);
                        }
                    });
                } else {
                	var txt = "当前应用在微信开放平台的审核尚未通过";
                	switch(err.code){
                        case -1:txt = "未知错误";break;
						case 0:txt = "成功,但授权失败";break;
                        case 1:txt = "用户取消";break;
                        case 2:txt = "用户拒绝授权";break;
                        case 3:txt = "当前设备未安装微信客户端";break;
					}
                    showToast(txt);
                }
            });
        } else {
            showToast('当前设备未安装微信客户端');
        }
    });
}

apiready = function() {
	mcm = initMCM();
	tipele = $api.byId("tips-1");
};
