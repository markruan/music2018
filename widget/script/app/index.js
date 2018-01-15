var myScroll;
var nowTab = 1;//当前Tab索引

//隐藏所有Tab Frame
function hideFrames(i) {
	console.log(debug(arguments));
//	if(i == 2){
//		api.setFrameGroupAttr({
//			name : tabList[i],
//			hidden : true
//		});
//	}else{
		api.setFrameAttr({
			name : tabList[i],
			hidden : true
		});
//	}
	
}

//切换Tab模块
function openTab(it,index,anmi) {
	console.log(debug(arguments));
//	console.log(nowTab+"|"+index);
	if(it == undefined || it == 'none'){
		return ;
	}
	index = (index == undefined)?1:index;
	anmi = (anmi == undefined)?"fade":"push";
	if(tabList[nowTab] == it){//点击当前页面
		anmi = "fade";
	}
	hideFrames(nowTab);
	
		
	var $header = $('#header'), $subNav = $('#subNav');
	//切换导航
	$header.find('.active').removeClass('active');
	$header.find('.' + it).addClass('active');
//	console.log($subNav.find('.' + it).hasClass('hide'))
//	if(!$subNav.find('.' + it).hasClass('hide')){
//		$subNav.find('.' + it).addClass('hide');
//	}
	$subNav.css("display","none");
	var mainPos, mainHeight, mainTop;
	switch(it) {
		case tabMine:
			mainPos = $('#main').offset();
			mainHeight = mainPos.height;
			mainTop = mainPos.top;
			api.openFrame({
				name : tabMine,
				url : tabMineURL,
				bounces : false,
				rect : {
					x : 0,
					y : mainTop,
					w : 'auto',
					h : mainHeight
				},
				animation:{
					type:anmi,                //动画类型（详见动画类型常量）
				    subType:"from_"+tabDirection(nowTab,index),       //动画子类型（详见动画子类型常量）
				    duration:300                //动画过渡时间，默认300毫秒
				}
			});
			nowTab = 0;
			break;
		case tabDiscover:
			mainPos = $('#main').offset();
			mainHeight = mainPos.height;
			mainTop = mainPos.top;
			api.openFrame({
				name : tabDiscover,
				url : tabDiscoverURL,
				bounces : false,
				rect : {
					x : 0,
					y : mainTop,
					w : 'auto',
					h : mainHeight
				},
				animation:{
					type:anmi,                //动画类型（详见动画类型常量）
				    subType:"from_"+tabDirection(nowTab,index),       //动画子类型（详见动画子类型常量）
				    duration:300                //动画过渡时间，默认300毫秒
				}
			});
			nowTab = 1;
			break;
		case tabGroupDownload:
			mainPos = $('#main').offset();
			mainHeight = mainPos.height;
			mainTop = mainPos.top;
			api.openFrame({
				name : "mod_download",
				url : "html/download/mod_download.html",
				bounces : false,
				scrollEnabled : true,
				rect : {
					x : 0,
					y : mainTop,
					w : 'auto',
					h : mainHeight
				},
				animation:{
					type:anmi,                //动画类型（详见动画类型常量）
				    subType:"from_"+tabDirection(nowTab,index),       //动画子类型（详见动画子类型常量）
				    duration:300                //动画过渡时间，默认300毫秒
				}
			});
			nowTab = 2;
			break;
		case tabSearch:
			//切换子导航
//			$('#subNav>div').addClass('hide');
		//	if ($subNav.find('.'+it)[0]) {
				$subNav.css("display","block");
		//	}
			mainPos = $('#main').offset();
			mainHeight = mainPos.height;
			mainTop = mainPos.top;
			api.openFrame({
				name : tabSearch,
				url : tabSearchURL,
				bounces : false,
				rect : {
					x : 0,
					y : mainTop,
					w : 'auto',
					h : mainHeight
				},
				animation:{
					type:anmi,                //动画类型（详见动画类型常量）
				    subType:"from_"+tabDirection(nowTab,index),       //动画子类型（详见动画子类型常量）
				    duration:300                //动画过渡时间，默认300毫秒
				},
			});
			nowTab = 3;
			break;
	}
}

//打开引导页
function openGuide() {
	console.log(debug(arguments));
	setTimeout(function() {
		api.openFrame({
			name : modGuide,
			url : modGuideURL,
			bounces : false,
			rect : {
				x : 0,
				y : 0,
				w : 'auto',
				h : 'auto'
			}
		});
	}, 100);
}

//打开mini播放器
function openMiniPlayer() {
	console.log(debug(arguments));
	var y = api.winHeight - 55;
	api.openFrame({
		name : modMiniPlayer,
		url : modMiniPlayerURL,
		bounces : false,
		rect : {
			x : 0,
			y : y,
			w : 'auto',
			h : 55
		}
	});
}

function loadPage(){
    api.closeFrame({name:modGuide});
    //页面内容填充初始化
    openTab(tabDiscover);
    openMiniPlayer();


    //退出应用事件监听
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.openFrame({
            name : modExit,
            url : modExitURL,
            bounces : false,
            bgColor : 'rgba(0,0,0,0.6)',
            rect : {
                x : 0,
                y : 0,
                w : 'auto',
                h : 'auto'
            }
        });
    });

    swipeTab(nowTab);

    //移除启动页
    setTimeout(function() {
        api.removeLaunchView();
    }, 400);
}

apiready = function() {
	console.log(debug(arguments));
	//双端header兼容性处理
	var header = document.querySelector('#header');
	$api.fixIos7Bar(header);
	api.setStatusBarStyle({
		style : 'light'
	});

	//引导页逻辑
	var showGuide = $api.getStorage('showGuide');
	if (showGuide) {//打开引导页
        loadPage();
    }else{
        openGuide();
	}
};
