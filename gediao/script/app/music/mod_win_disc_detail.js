apiready = function() {
	console.log(debug(arguments));
	//主要内容
	api.openFrame({
		name : modDiscDetailC,
		url : "../../"+modDiscDetailCURL,
		bounces : false,
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : 'auto'
		},
		pageParam:{
			typeid:api.pageParam.typeid
		}
	});

	//透明header
	var height = 56;
	//适配iOS7+状态栏
	if (api.systemType == 'ios') {
		var ver = api.systemVersion;
		var num = parseInt(ver, 10);
		var fullScreen = api.fullScreen;
		var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
		if (num >= 7 && !fullScreen && iOS7StatusBarAppearance) {
			height += 20;
		}
	}
	api.openFrame({
		name : modDiscDetailH,
		url : "../../"+modDiscDetailHURL,
		bounces : false,
		bgColor : 'rgba(0,0,0,0)',
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : height
		}
	});
};

function closeThis(){
	console.log("doClose")
    api.closeFrame({name:modDiscDetailC});
    api.closeFrame({name:modDiscDetailH});
    api.closeFrame();
}