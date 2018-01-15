//百度音乐API对象
var bm;

//点击焦点图的操作
function clickBanner(url){
    notification()
	if(url.indexOf("http://") > -1){
        loading();
        console.log("BannerURL:"+url);
        api.openWin({
            name: "MUSIC_BANNER_FRAME",
            url: "../../html/discover/mod_banner.html",
            bounces: false,
            animation: {
                type: "movein", //动画类型（详见动画类型常量）
                subType: "from_right", //动画子类型（详见动画子类型常量）
                duration: 300 //动画过渡时间，默认300毫秒
            },
            pageParam:{
                url:url
            }
        });
        finishing();
	}else{
		showToast("暂未匹配到对应的轮播资讯");
	}
}
//打开音乐详情界面
function openMusicDetail(songid) {
    notification()
    loading();
    console.log(debug(arguments));
    api.openFrame({
        name: modMusicDetail,
        url: "../../"+modMusicDetailURL,
        bounces: false,
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        },
		pageParam:{
            songid:songid
        }
    });
    finishing();
}


//更多
function getMore(listtypeid){
    notification()
    loading();
    console.log(debug(arguments));
	api.openFrame({
		name : modWinDiscDetail,
		url : "../../"+modWinDiscDetailURL,
		animation : {
			type : 'movein',
			subType : 'from_right'
		},
		pageParam:{
			typeid:listtypeid
		}
	});
	finishing();
}


apiready = function() {
	console.log(debug(arguments));
	// api.showProgress({
	//     title: '努力加载中...',
	//     text: '',
	//     modal: true
	// });
	bm = new baiduMusic();

	//	var model = api.require('model');
	//	model.config({
	//		appKey : '504531E6-7C61-3EF7-61FE-0B92A21FDED1',
	//		host : 'https://d.apicloud.com'
	//	});
	//	var query = api.require('query');
	//	query.createQuery(function(ret, err) {
	//		if (ret && ret.qid) {
	//			var queryId = ret.qid;
	//			model.findAll({
	//				class : "discover",
	//				qid : queryId
	//			}, function(ret, err) {
	//				if (ret) {
	//					// alert(JSON.stringify(ret));
	//
	//					var data = {
	//						type1 : [], //新闻
	//						type2 : [], //北京
	//						type3 : [] //音乐
	//					};
	//					for (var i = 0, len = ret.length; i < len; i++) {
	//						if (ret[i].type == '新闻') {
	//							data.type1.push(ret[i]);
	//						}
	//						if (ret[i].type == '北京') {
	//							data.type2.push(ret[i]);
	//						}
	//						if (ret[i].type == '音乐') {
	//							data.type3.push(ret[i]);
	//						}
	//					}
	//
	//					//假数据
	//					data.type4 = data.type1;
	//					data.type5 = data.type2;
	//					data.type6 = data.type3;
	//					data.type7 = data.type1;
	//					data.type8 = data.type2;
	//					data.type9 = data.type3;
	//
	//					// alert(JSON.stringify(data));
	//
	//					//渲染模板
	//					var template = document.getElementById('template');
	//					var disc_content = document.getElementById('disc_content');
	//					var pagefn = doT.template(template.text);
	//					disc_content.innerHTML = pagefn(data);
	//
	//					//重新解析tapmode
	//					api.parseTapmode();
	//
	//					$('#loading').hide();
	//					// api.hideProgress();
	//
	//					//lazyload
	//					echo.init({
	//						offset : 100,
	//						throttle : 250,
	//						callback : function(element, op) {
	//						}
	//					});
	//
	//				}
	//			});
	//		}
	//	});

	bm.send(bm.slide(), function(ret, err) {
		var ihtml = "";
		var banner = ret.pic;

		var templateBanner = document.getElementById('templateBanner');
		var swipe_wrap = document.getElementById('swipe-wrap');
		var bannerfn = doT.template(templateBanner.text);
		swipe_wrap.innerHTML = bannerfn(banner);
		api.parseTapmode();

		var per = parseInt(100 / banner.length);
		$('#slide .pointer').css('width', per + '%');
		window.mySwipe = new Swipe(document.getElementById('slide'), {
			//			startSlide: 1,  //起始图片切换的索引位置
			auto : 5000, //设置自动切换时间，单位毫秒
			continuous : true, //无限循环的图片切换效果
			disableScroll : true, //阻止由于触摸而滚动屏幕
			stopPropagation : true, ////停止滑动事件
			callback : function(index, elem) {
				//				console.log(banner.length+"|"+index+"|"+$('#slide .pointer').css('width')+"|"+$('#slide .pointer').css('left'))
				var left = per * index;
				$('#slide .pointer').css('left', left + '%');
			},
			transitionEnd : function(index, elem) {
			}
		});
	});

//	$api.rmStorage("indexHistoryHtml");
	//递归遍历读取各个榜单
	var listRe = new Array();
	//准备接受容器
	var template = document.getElementById('template');
	var disc_content = document.getElementById('disc_content');
	var pagefn = doT.template(template.text);
	var indexHistoryHtml = $api.getStorage('indexHistoryHtml');
	var indexHistorySign = $api.getStorage('indexHistorySign');
	var ihtml = "";
	var ind = -1;//游标
	if(indexHistoryHtml != undefined && indexHistorySign != undefined){
		console.log("首页历史数据："+new Date().toLocaleDateString()+"|"+indexHistoryHtml);
		if(indexHistorySign != new Date().toLocaleDateString()){
			listRecurSend(bm, ind, listRe,function(listReparams){
				listRe = listReparams;
				ihtml =  pagefn(listRe);
				$api.setStorage('indexHistoryHtml', ihtml);
				//存储标记,一天更新一次本地缓存数据
				$api.setStorage('indexHistorySign', new Date().toLocaleDateString());
				disc_content.innerHTML = ihtml;
				api.parseTapmode();
				$('#loading').hide();
			});
		}else{
			ihtml = indexHistoryHtml;
			disc_content.innerHTML = ihtml;
			api.parseTapmode();
			$('#loading').hide();
		}
	}else{
		listRecurSend(bm, ind, listRe,function(listReparams){
			listRe = listReparams;
			ihtml =  pagefn(listRe);
			$api.setStorage('indexHistoryHtml', ihtml);
			//存储标记,一天更新一次本地缓存数据
			$api.setStorage('indexHistorySign', new Date().toLocaleDateString());
			disc_content.innerHTML = ihtml;
			api.parseTapmode();
			$('#loading').hide();
		});
	}
	
	

	swipeTab(1);

	// api.addEventListener({
	//     name: 'scrolltobottom'
	// }, function(ret, err){

	// });

};
