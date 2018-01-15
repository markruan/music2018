//百度音乐API对象
var bm;
var header;
var headerPos;
var mcm;
/**
 * 撤销表单内容
 */
function del() {
    notification()
	console.log(debug(arguments));
	var input = document.querySelector('.inputbox input');
	input.value = '';
	scriptFrame(modSearchRes, 'history();');
}

function refresh() {
	scriptFrame(modSearchRes, 'history();');
}

/**
 * 清空本地缓存的搜索历史记录
 */
function delStorage() {
    notification()
	alert("请空搜索历史记录！");
	$api.rmStorage('searchHistoryList');
	scriptFrame(modSearchRes, 'history();');
}

/**
 * 搜索记录存储到云端
 */
function saveSearch(searchVal) {
	//先检查云端有没有该记录,有则更新计数器,反之,增加记录
	var query = api.require('query');
	query.createQuery(function(ret, err) {
		if (ret) {
			query.whereEqual({
				qid : ret.qid,
				column : 'searchVal',
				value : $api.trimAll(searchVal)
			});
			mcm.findAll({
				class : "searchHot",
				qid : ret.qid
			}, function(retu, err) {
				console.log(JSON.stringify(retu))
				if (retu.length > 0) {//有匹配数据,更新云端计数器
					mcm.updateById({
						class : 'searchHot',
						id : retu[0].id,
						value : {
							hotNum : parseInt(retu[0].hotNum + 1)
						}
					}, function(ret, err) {
						if (ret) {
							console.log(JSON.stringify(ret));
						} else {
							console.log(JSON.stringify(err));
						}
					});
				} else {//无匹配数据,新增
					mcm.insert({
						class : 'searchHot',
						value : {
							searchVal : $api.trimAll(searchVal),
							hotNum : 1
						}
					}, function(ret, err) {
						if (ret) {
							console.log(JSON.stringify(ret));
						} else {
							console.log(JSON.stringify(err));
						}
					});
				}
			});
		} else {
			var tip = "未知错误,请检查网络连接状态！";
			alert(tip);
		}
	});
}

/**
 * 搜索
 */
function search(seaval) {
	api.showProgress();
	seaval = (seaval == undefined) ? $api.val($api.byId("seaval")) : seaval;
	if (seaval.trim() != "") {
		saveSearch(seaval);
		var searchHistoryList;
		searchHistoryList = $api.getStorage('searchHistoryList');
		if (searchHistoryList != undefined) {
			if (searchHistoryList.length >= 8) {//当本地存储超过?条
				for (var i = searchHistoryList.length - 1; i >= 0; i--) {
					if (searchHistoryList[i] == seaval) {
						searchHistoryList.splice(i, 1);
						continue;
					}
					searchHistoryList[i] = searchHistoryList[i - 1];
					//元素后移
				}
				searchHistoryList[0] = seaval;
				//把新的元素更新到第一个位置
			} else {
				for (var i = searchHistoryList.length - 1; i >= 0; i--) {
					if (searchHistoryList[i] == seaval) {
						searchHistoryList.splice(i, 1);
						continue;
					}
					searchHistoryList[i + 1] = searchHistoryList[i];
					//元素后移
				}
				searchHistoryList[0] = seaval;
				//把新的元素更新到第一个位置
			}
		} else {
			searchHistoryList = new Array();
			searchHistoryList[0] = seaval;
		}
		$api.setStorage('searchHistoryList', searchHistoryList);

		bm.send(bm.search(seaval), function(ret, err) {
			console.log(JSON.stringify(ret));
			//直接临时存起来
			$api.setStorage('searchResult', ret.song);
			var jsfun = 'result()';
			if (ret.error_code != '22000') {
				jsfun = 'result("none")';
			}
			scriptFrame(modSearchRes, jsfun);
			api.hideProgress();
		});
	} else {
		scriptFrame(modSearchRes, 'result("none")');
		api.hideProgress();
	}
}

apiready = function() {
	loading("加载中");
	console.log(debug(arguments));
	header = document.querySelector('header');
	$api.fixIos7Bar(header);

	bm = new baiduMusic();
	mcm = initMCM();

	var recent = document.querySelector('#recent');
	headerPos = $api.offset(recent);
	api.openFrame({
		name : modSearchRes,
		url : "../../" + modSearchResURL,
		rect : {
			x : 0,
			y : headerPos.t + headerPos.h,
			w : 'auto',
			h : 'auto'
		}
	});
	
	//这里有可能会出现一个运行时异常,因为searchResFrame还没打开,就开始调用,会出现找不到result方法
	var params = api.pageParam;
	var searchVal = params.searchVal;
	if (searchVal) {
		$api.val($api.byId("seaval"), searchVal);
		setTimeout(function(){
			finishing();
			search();
		},300)
	}else{
		finishing();
	}
	
};
