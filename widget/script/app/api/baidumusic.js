/**
 * 百度音乐API接口方法
 * 需要依赖api类
 * @author chitry@126.com 
 * 
 * http://tingapi.ting.baidu.com/v1/restserver/ting
 * 获取方式：GET
 * 参数：format=json或xml&calback=&from=webapp_music&method=以下不同的参数获得不同的数据
 * format根据开发需要可选择json或xmml，其他参数对应填入，calback是等于空的。
 * 
 * 返回参数:
 * error_code:22000 代表成功！
 */

var ApiURL = "http://tingapi.ting.baidu.com/v1/restserver/ting";
var method = "GET";
var dType = "json";

/**
 * 拼接请求地址和参数 
 */
function baiduMusicURL(method,params){
	params = (params == undefined)?"":params;
	return ApiURL+"?method="+method+params;
}

var listAry = [1,2,11,12,16,21,22,23,24,25];

function listName(type){//获取榜单名称
	switch(type){
		case 1:return '新歌榜';
		case 2:return '热歌榜';
		case 11:return '摇滚榜';
		case 12:return '爵士榜';
		case 16:return '流行音乐榜';
		case 21:return '欧美金曲榜';
		case 22:return '经典老歌榜';
		case 23:return '情歌榜';
		case 24:return '影视金曲榜';
		case 25:return '网络歌曲榜';
		default:return '非法索引！';			
	}
}


/**
 * 百度音乐接口对象 
 */
function baiduMusic(){

	
	
	/**
	 *  使用示例
	 * 	var bm = new baiduMusic();
	 *  bm.send(bm.info(877578),function(ret,err){
			zxx_netAudio(netAudio,ret.bitrate.file_link);
		}); 
	 */
	this.send = function(doUrl,callback){//发送远程请求
	    if(typeof callback !== 'function'){ //检查回调函数是否可用调用的 
	     	callback = false; 
	    } 
	    api.ajax({
			url : doUrl,
			dataType : dType,
		}, function(ret, err) {
			console.log(debug(arguments,"third"));
//			console.log("百度音乐API请求地址："+doUrl);
//			console.log("返回数据："+JSON.stringify(ret));
//			console.log("状态信息："+JSON.stringify(err));
			callback(ret,err);//回调
		});
	}
	
	
	
	//#########################  接口主要方法  ###########################################//
	
	this.slide = function(){//百度音乐幻灯片接口
		return baiduMusicURL("baidu.ting.plaza.getFocusPic","&from=android&version=2.4.0&format=json&limit=111");
	}
	
	this.list = function(type,size,offset){//获取百度音乐排行榜单信息接口
		console.log(debug(arguments,"third"));
		type = (type == undefined)?1:type;//默认获取新歌榜
		size = (size == undefined)?10:size;//默认10条
		offset = (offset == undefined)?0:offset;//默认无偏移
		return baiduMusicURL("baidu.ting.billboard.billList","&type="+type+"&size="+size+"&offset="+offset);
	}
	
	this.search = function(query){//百度音乐搜索接口
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.search.catalogSug","&query="+query);
	}
	
	this.info = function(songid){//百度音乐单曲详细信息接口(含播放链接地址)
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.song.play","&songid="+songid);
	}
	
	this.lrc = function(songid){//百度音乐歌词接口
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.song.lry","&songid="+songid);
	}
	
	this.recommendList = function(song_id,num){//百度音乐推荐接口
		num = (num == undefined)?5:num;//默认获取5条推荐数据
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.song.getRecommandSongList","&songid="+songid+"&num="+num);
	}
	
	this.download = function(songid,bit){//百度音乐下载接口
		bit = (bit == undefined)?24:bit;//默认码率24
		console.log(debug(arguments,"third"));
		console.log("百度音乐下载："+songid+"|"+bit+"|"+new Date().getTime());
		return baiduMusicURL("baidu.ting.song.downWeb","&songid="+songid+"&bit="+bit+"&_t="+new Date().getTime());
	}
	
	this.singer = function(tinguid){//百度音乐歌手信息接口
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.artist.getInfo","&tinguid="+tinguid);
	}
	
	this.singerSong = function(tinguid,limits){//百度音乐歌手歌曲接口
		console.log(debug(arguments,"third"));
		return baiduMusicURL("baidu.ting.artist.getSongList","&tinguid="+tinguid+"&limits="+limits+"&use_cluster=1&order=2");
	}

	this.mv = function(songid,callback){
        api.ajax({
            url : "http://music.baidu.com/playmv/"+songid,
            dataType : 'html',
			data:{"songId":null,"title":"\u6211\u5bb3\u6015","albumId":null,"albumTitle":null,"author":"\u859b\u4e4b\u8c26","authorId":"2517","time":null,"publishTime":null,"tvid":null,"vid":null,"resourceType":null,"relateStatus":null,"moduleName":"mvCover","id":null,"delStatus":null}
        }, function(ret, err) {
            console.log("RES:"+JSON.stringify(ret)+"|"+JSON.stringify(err));
            callback(ret,err);//回调
        });
	}
}


function listRecurSend(bm,ind,listRe,callback){//递归发送多条请求以获取所有榜单数据
	ind++;
	//递归出口
	if(ind>= listAry.length){
		if(typeof callback !== 'function'){ //检查回调函数是否可用调用的 
	     	callback = false; 
	    } 
	    callback(listRe);//回调
		return listRe;
	}
	var type = listAry[ind];
	bm.send(bm.list(type, 4, 0), function(ret, err) {
		ret.song_list[0].song_source = listName(type);
		ret.song_list[0].learn = type;
//		console.log("递归打印："+JSON.stringify(ret.song_list));
		listRe.push(ret.song_list);
		listRecurSend(bm,ind,listRe,callback);
	});
}




//#############################################  接口方法说明  #############################################//

/**
 * 百度音乐幻灯片接口
 * 
 * method=baidu.ting.plaza.getFocusPic&from=android&version=2.4.0&format=json&limit=111
 * 
 * 返回示例：
 * {
    "pic": [
        {
            "type": 6,
            "mo_type": 4,
            "code": "http://music.baidu.com/h5pc/spec_detail?id=276&columnid=88",
            "randpic": "http://business.cdn.qianqian.com/qianqian/pic/bos_client_14927624484c83eb05148408e25892d8544de7b5f7.jpg",
            "randpic_ios5": "",
            "randpic_desc": "",
            "randpic_ipad": "http://business.cdn.qianqian.com/qianqian/pic/bos_client_14927624560af1e3427c79a6d96be34d7e0f46802c.jpg",
            "randpic_qq": "",
            "randpic_2": "",
            "randpic_iphone6": "",
            "special_type": 0,
            "ipad_desc": "在云端16",
            "is_publish": "111111"
        }
    ],
    "error_code": 22000
}
 */

/**
 * 获取百度音乐排行榜单信息接口
 * 
 * method=baidu.ting.billboard.billList&type=1&size=10&offset=0
 * 参数：type = 1-新歌榜,2-热歌榜,11-摇滚榜,12-爵士,16-流行,21-欧美金曲榜,22-经典老歌榜,23-情歌对唱榜,24-影视金曲榜,25-网络歌曲榜 
 * 参数：size = 10 //返回条目数量
 * 参数：offset = 0 //获取偏移
 * 
 * 返回示例：
 * {
    "song_list": [
        {
            "artist_id": "88",
            "language": "国语",
            "pic_big": "http://musicdata.baidu.com/data2/pic/2fc09c235797a3a01e9933c9ed37f9eb/540177136/540177136.jpg@s_0,w_150",
            "pic_small": "http://musicdata.baidu.com/data2/pic/2fc09c235797a3a01e9933c9ed37f9eb/540177136/540177136.jpg@s_0,w_90",
            "country": "内地",
            "area": "0",
            "publishtime": "2017-04-11",
            "album_no": "0",
            "lrclink": "http://musicdata.baidu.com/data2/lrc/7dcfd5d0a77f03326858a34c89aba719/540176777/540176777.lrc",
            "copy_type": "1",
            "hot": "313683",
            "all_artist_ting_uid": "2517",
            "resource_type": "0",
            "is_new": "1",
            "rank_change": "0",
            "rank": "1",
            "all_artist_id": "88",
            "style": "",
            "del_status": "0",
            "relate_status": "0",
            "toneid": "0",
            "all_rate": "64,128,256,320,flac",
            "file_duration": 312,
            "has_mv_mobile": 0,
            "versions": "",
            "bitrate_fee": "{\"0\":\"0|0\",\"1\":\"0|0\"}",
            "song_id": "540175998",
            "title": "暧昧",
            "ting_uid": "2517",
            "author": "薛之谦",
            "album_id": "540175996",
            "album_title": "暧昧",
            "is_first_publish": 0,
            "havehigh": 2,
            "charge": 0,
            "has_mv": 0,
            "learn": 0,
            "song_source": "web",
            "piao_id": "0",
            "korean_bb_song": "0",
            "resource_type_ext": "0",
            "mv_provider": "0000000000",
            "artist_name": "薛之谦"
        }
   }
 */


/**
 * 百度音乐搜索接口
 * 
 * method=baidu.ting.search.catalogSug&query=海阔天空
 * 参数：query = '' //搜索关键字
 * 
 * 返回示例：
 * {
    "song": [
        {
            "bitrate_fee": "{\"0\":\"129|-1\",\"1\":\"-1|-1\"}",
            "weight": "5190",
            "songname": "海阔天空",
            "songid": "268425156",
            "has_mv": "0",
            "yyr_artist": "0",
            "resource_type_ext": "0",
            "artistname": "韩红",
            "info": "",
            "resource_provider": "1",
            "control": "0000000000",
            "encrypted_songid": "2107fffd7c409584153f0L"
        }, 
        {
            "bitrate_fee": "{\"0\":\"0|0\",\"1\":\"0|0\"}",
            "weight": "100",
            "songname": "海阔天空-电吉他版",
            "songid": "73984962",
            "has_mv": "0",
            "yyr_artist": "1",
            "resource_type_ext": "0",
            "artistname": "MC雪殇",
            "info": "",
            "resource_provider": "1",
            "control": "0100000000",
            "encrypted_songid": ""
        },
        
    ],
    "order": "artist,song",
    "error_code": 22000,
    "artist": [
        {
            "yyr_artist": "0",
            "artistname": "海阔天空",
            "artistid": "2345733",
            "artistpic": "http://qukufile2.qianqian.com/data2/music/5F1741B07058A32998B93B4DE698450B/252837196/252837196.jpg@s_0,w_48",
            "weight": "0"
        }
    ]
   }
 */



/**
 * 百度音乐单曲详细信息接口(含播放链接地址)
 * 
 * method=baidu.ting.song.play&songid=877578
 * 参数：songid = 877578 //歌曲id
 * 
 * 返回示例：
 * {
    "songinfo": {
        "special_type": 0,
        "pic_huge": "",
        "resource_type": "2",
        "pic_premium": "http://musicdata.baidu.com/data2/pic/88582702/88582702.jpg@s_0,w_500",
        "havehigh": 2,
        "author": "Beyond",
        "toneid": "600902000004240302",
        "has_mv": 1,
        "song_id": "877578",
        "piao_id": "0",
        "artist_id": "130",
        "lrclink": "http://musicdata.baidu.com/data2/lrc/238975978/238975978.lrc",
        "relate_status": "1",
        "learn": 1,
        "pic_big": "http://musicdata.baidu.com/data2/pic/88582702/88582702.jpg@s_0,w_150",
        "play_type": 0,
        "album_id": "197864",
        "album_title": "海阔天空",
        "bitrate_fee": "{\"0\":\"0|0\",\"1\":\"0|0\"}",
        "song_source": "web",
        "all_artist_id": "130",
        "all_artist_ting_uid": "1100",
        "all_rate": "64,128,192,256,320,flac",
        "charge": 0,
        "copy_type": "0",
        "is_first_publish": 0,
        "korean_bb_song": "0",
        "pic_radio": "http://musicdata.baidu.com/data2/pic/88582702/88582702.jpg@s_0,w_300",
        "has_mv_mobile": 0,
        "title": "海阔天空",
        "pic_small": "http://musicdata.baidu.com/data2/pic/88582702/88582702.jpg@s_0,w_90",
        "album_no": "1",
        "resource_type_ext": "0",
        "ting_uid": "1100"
    },
    "error_code": 22000,
    "bitrate": {
        "show_link": "",
        "free": 1,
        "song_file_id": 42783748,
        "file_size": 2679447,
        "file_extension": "mp3",
        "file_duration": 322,
        "file_bitrate": 64,
        "file_link": "http://yinyueshiting.baidu.com/data2/music/42783748/42783748.mp3?xcode=744acef8840c7637f5d44a3a1acfff98",
        "hash": "74d926076dc8f2f857ffaa403d79935a65f80dec"
    }
   }
 */




/**
 * 百度音乐歌词接口
 * 
 * method=baidu.ting.song.lry&songid=877578
 * 参数：songid = 877578 //歌曲id
 * 
 * 返回示例：
 * {
    "title": "海阔天空",
    "lrcContent": "[00:00.33]海阔天空\n[00:02.87]作词：黄家驹  作曲：黄家驹\n[00:04.61]演唱：Beyond\n[00:06.51]\n[00:18.58]今天我 寒夜里看雪飘过\n[00:25.05]怀着冷却了的心窝漂远方\n[00:30.99]风雨里追赶 雾里分不清影踪\n[00:37.15]天空海阔你与我 可会变 (谁没在变)\n[00:43.86]\n[00:44.19]多少次 迎着冷眼与嘲笑\n[00:49.96]从没有放弃过心中的理想\n[00:55.94]一刹那恍惚 若有所失的感觉\n[01:02.06]不知不觉已变淡 心里爱 (谁明白我)\n[01:08.66]\n[01:08.93]原谅我这一生不羁放纵爱自由\n[01:15.88]也会怕有一天会跌倒\n[01:21.99]背弃了理想 谁人都可以\n[01:28.37]哪会怕有一天只你共我\n[01:34.01]\n[01:42.87]今天我 寒夜里看雪飘过\n[01:49.28]怀着冷却了的心窝漂远方\n[01:55.10]风雨里追赶 雾里分不清影踪\n[02:01.46]天空海阔你与我 可会变 (谁没在变)\n[02:08.17]\n[02:08.39]原谅我这一生不羁放纵爱自由\n[02:15.26]也会怕有一天会跌倒\n[02:21.41]背弃了理想 谁人都可以\n[02:27.56]哪会怕有一天只你共我\n[02:33.38]\n[03:08.48]仍然自由自我 永远高唱我歌\n[03:15.16]走遍千里\n[03:19.41]\n[03:19.99]原谅我这一生不羁放纵爱自由\n[03:26.78]也会怕有一天会跌倒\n[03:33.05]背弃了理想 谁人都可以\n[03:38.88]哪会怕有一天只你共我\n[03:45.72]背弃了理想 谁人都可以\n[03:51.71]哪会怕有一天只你共我\n[03:57.38]\n[03:57.88]原谅我这一生不羁放纵爱自由\n[04:04.23]也会怕有一天会跌倒\n[04:10.52]背弃了理想 谁人都可以\n[04:16.63]哪会怕有一天只你共我\n[04:22.80]"
   } 
 */



/**
 * 百度音乐推荐接口
 * method=baidu.ting.song.getRecommandSongList&song_id=877578&num=5
 * 参数：song_id = 877578 
 * 参数：num = 5//返回条目数量
 * 
 * 返回示例：
 * {
    "error_code": 22000,
    "result": {
        "list": [
            {
                "artist_id": "116",
                "all_artist_id": "116",
                "all_artist_ting_uid": "1091",
                "language": "国语",
                "publishtime": "1987-01-02",
                "album_no": "10",
                "toneid": "600902000005274939",
                "all_rate": "128,192,256,320,flac",
                "pic_small": "http://musicdata.baidu.com/data2/pic/88410360/88410360.jpg@s_0,w_90",
                "pic_big": "http://musicdata.baidu.com/data2/pic/88410360/88410360.jpg@s_0,w_150",
                "hot": "116373",
                "has_mv_mobile": 1,
                "versions": "",
                "bitrate_fee": "{\"0\":\"0|0\",\"1\":\"0|0\"}",
                "del_status": "0",
                "song_id": "290008",
                "title": "我只在乎你",
                "ting_uid": "1091",
                "author": "邓丽君",
                "album_id": "74015",
                "album_title": "我只在乎你",
                "is_first_publish": 0,
                "havehigh": 2,
                "charge": 0,
                "has_mv": 1,
                "learn": 1,
                "song_source": "web",
                "piao_id": "0",
                "korean_bb_song": "0",
                "resource_type_ext": "0",
                "mv_provider": "1100000000"
            }
        ]
    }
   }
 */



/**
 * 百度音乐下载接口
 * 
 * method=baidu.ting.song.downWeb&songid=877578&bit=24&_t=1393123213
 * 参数：songid = 877578//歌曲id
 * 参数：bit = 24, 64, 128, 192, 256, 320 ,flac//码率
 * 参数：_t = 1430215999,, //时间戳 
 * 
 * 返回示例：...
 */



/**
 * 百度音乐歌手信息接口
 * 
 * method=baidu.ting.artist.getInfo&tinguid=877578
 * 参数：tinguid = 877578 //歌手ting id
 * 
 * 返回示例：
 * 
 */



/**
 * 百度音乐歌手歌曲接口
 * 
 * method=baidu.ting.artist.getSongList&tinguid=877578&limits=6&use_cluster=1&order=2
 * 参数：tinguid = 877578//歌手ting id
 * 参数：limits = 6//返回条目数量 
 */
