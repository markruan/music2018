function goSearch(searchVal) {
    notification()
	api.openWin({
		name : tabWinSearch,
		url : "../../"+tabWinSearchURL,
		animation : {
			type : 'fade'
		},
		pageParam : {//传递页面参数,新页面通过api.pageParam获取
			searchVal : searchVal
		}
	});
}

//打开搜索框
function gotoSearch() {
    notification()
	console.log(debug(arguments));
	api.openWin({
		name : tabWinSearch,
		url : "../../"+tabWinSearchURL,
		animation : {
			type : 'fade'
		}
	});
}

apiready = function() {
	console.log(debug(arguments));
	//1px线
	if (window.devicePixelRatio && devicePixelRatio >= 2) {
		document.querySelector('ul').className = 'hairlines';
	}

	//云API
	var appid = 'A6947399513900', appkey = 'C9DEA65B-51D1-E5B7-C6BE-A07FF3051FA0';
	var now = Date.now();
	var hashStr = appid + 'UZ' + appkey + 'UZ' + now;
	var shaObj = new jsSHA(hashStr, "TEXT");
	var hash = shaObj.getHash("SHA-1", "HEX");
	hash = hash + '.' + now;
	// alert(hash);

	api.showProgress({
		title : '加载中...',
		text : '',
		modal : true
	});

	api.ajax({
		url : 'https://d.apicloud.com/mcm/api/searchHot?filter[order]=hotNum DESC&filter[limit]=10',
		dataType : 'json',
		// returnAll:false,
		headers : {
			'X-APICloud-AppId' : appid,
			'X-APICloud-AppKey' : hash
		}
	}, function(ret, err) {
		if (ret) {
			// alert(JSON.stringify(ret));
			var i = 0, len = ret.length;
			var htmlStr = '';
			for (i; i < len; i++) {
				var item = ret[i];
				var topClass = '';
				if (i < 3) {
					topClass = 'top';
				}
				htmlStr += '<li tapmode="active" class="' + topClass + '" onclick="goSearch(\'' + item.searchVal + '\')">' + '<div class="inner">' + '<em>' + (i + 1) + '</em>' + '<label for="">' + item.searchVal + '</label>' + '<i>' + item.hotNum + '</i>' + '</div>' + '</li>';
			}
			$api.byId('rank').innerHTML = htmlStr;
			api.hideProgress();
		} else {
			$api.byId('rank').innerHTML = "<p class='msg'>暂未找到匹配的结果</p>";
			api.hideProgress();
		}
	});

};
