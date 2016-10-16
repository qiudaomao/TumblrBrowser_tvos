const API_KEY='jrsCWX1XDuVxAFO4GkK147syAoN8BJZ5voz8tS80bPcj26Vc5Z';
const HOST='https://api.tumblr.com';
const POST_PAR='reblog_info=True';//&type=video';
//https://api.tumblr.com/v2/blog/ziweia/posts?api_key=jrsCWX1XDuVxAFO4GkK147syAoN8BJZ5voz8tS80bPcj26Vc5Z&reblog_info=True&type=video

var postDoc;
var postData;

var getPostDocWithUID = function(uid='ziweia', page=0, callback) {
    var limit=22;
	var url = `${HOST}/v2/blog/${uid}/posts?api_key=${API_KEY}&${POST_PAR}&offset=${limit*page}&limit=${limit}`;
	console.log("url="+url);
	getHTTP(url, function(content) {
		//console.log("content: "+content);
		let data = JSON.parse(content);
        postData = data;
		var text = `<?xml version="1.0" encoding="UTF-8" ?>
		<document>
		   <stackTemplate>
			  <banner>
				<title><![CDATA[${data['response']['blog']['title']}(${uid})]]></title>
			  </banner>
			  <collectionList>
			  <grid>
				 <section>`;
        var index=0;
        var total_posts = data['response']['total_posts'];
		for (var item of data['response']['posts']) {
            index++;
            if (item['type']=='video') {
                console.log("item['type']: " + item['type']);
                if (item['video'] == null) continue;
                if (item['video_type'] != 'tumblr') continue;
                text += `
					<lockup onselect="play('${item['video']['sizes']['original']['url']}')" onholdselect="showPost('${item['reblogged_from_name']}')">
					   <img src="${item['thumbnail_url']}" width="250" height="376" />`;
                if (item['reblogged_from_title']) {
                    text += `
					   <title><![CDATA[${item['reblogged_from_title']}]]></title>
					   <subtitle><![CDATA[长按${item['reblogged_from_name']}]]></subtitle>
                       <overlay style="padding: 0">
                       <title style="background-;olor: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center; font-size: 22">视频</title>
                       </overlay>`;
                } else {
                    text += `
					   <title><![CDATA[${item['blog_name']}]]></title>
                       <overlay style="padding: 0">
                       <title style="background-color: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center; font-size: 22">视频</title>
                       </overlay>`;
                }
                text += `
					</lockup>`;
            } else if (item['type']=='photo') {
                text += `
					<lockup onselect="showpics('${index-1}')" onholdselect="showPost('${item['reblogged_from_name']}')">
					   <img src="${item['photos'][0]['alt_sizes'][0]['url']}" width="250" height="376" />`;
                if (item['reblogged_from_title']) {
                    text += `
					   <title><![CDATA[${item['reblogged_from_title']}]]></title>
					   <subtitle><![CDATA[长按${item['reblogged_from_name']}]]></subtitle>
                       <overlay style="padding: 0">
                       <title style="background-color: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center;font-size: 22">图片${item['photos'].length}张</title>
                       </overlay>`;                                                                        
                } else {
                    text += `
					   <title><![CDATA[${item['blog_name']}]]></title>
                       <overlay style="padding: 0">
                       <title style="background-color: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center;font-size: 22">图片${item['photos'].length}张</title>
                       </overlay>`;                                                                        
                }
                text += `
					</lockup>`;
            } else if (item['type']=='text') {
                text += `
					<lockup onselect="showtext('${index-1}')" onholdselect="showPost('${item['reblogged_from_name']}')">
					   <img src="https://api.tumblr.com/v2/blog/${uid}.tumblr.com/avatar/512" width="250" height="376" />`;
                if (item['reblogged_from_title']) {
                    text += `
					   <title><![CDATA[${item['reblogged_from_title']}]]></title>
					   <subtitle><![CDATA[长按${item['reblogged_from_name']}]]></subtitle>
                       <overlay style="padding: 0">
                       <title style="background-color: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center;font-size: 22">文字</title>
                       </overlay>`;                                                                        
                } else {
                    text += `
					   <title><![CDATA[${item['title']}]]></title>
                       <overlay style="padding: 0">
                       <title style="background-color: rgba(0,0,0,0.4); color: #FFFFFF; text-align: center;font-size: 22">文字</title>
                       </overlay>`;                                                                        
                }
                text += `
					</lockup>`;
            }
        }
        if ((page+1)*limit < total_posts) {
            text += `
					<lockup onselect="showPost('${uid}',${page+1})">
					   <img src="http://fuzhuo.qiniudn.com/next.png" width="250" height="376" />
					   <title>下一页</title>
					</lockup>`;
        }
		text += `
				 </section>
			  </grid>
			  </collectionList>
		   </stackTemplate>
		</document>`
		console.log("text = " + text);
		callback((new DOMParser).parseFromString(text, "application/xml"));
	});
}

function showPost(uid,page=0) {
    if (typeof uid === 'undefined' || uid == 'undefined') return;
    var loading = createLoadingDocument(`加载${uid}信息中..`);
    navigationDocument.pushDocument(loading);
	getPostDocWithUID(uid, page, function(doc) {
        navigationDocument.replaceDocument(doc, loading);
	});
}

function play(url) {
    var video = new MediaItem('video', url);
    var videoList = new Playlist();
    videoList.push(video);
    var myPlayer = new Player();
    myPlayer.playlist = videoList;
    myPlayer.play();
}

function showpics(index) {
    console.log("showpics: " + index);
    var text = `<?xml version="1.0" encoding="UTF-8" ?>
		<document>
		   <head>
			  <style>
				 * {
					tv-transition: push;
				 }
			  </style>
		   </head>
		   <oneupTemplate mode="oneup caption">
			  <section>`;
    var photos = postData['response']['posts'][index]['photos'];
    for (var item in photos) {
        text += `
				 <lockup>
					<img src="${photos[item]['original_size']['url']}" />
					<title>${parseInt(item)+1}/${photos.length}</title>
				 </lockup>`;
    }
        text += `
			  </section>
		   </oneupTemplate>
		</document>`;
    console.log("text: " + text);
    doc = (new DOMParser).parseFromString(text, "application/xml");
    navigationDocument.pushDocument(doc);
}

var addDecodeFunc = function(){
    this.REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
    this.REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
    this.REGX_TRIM = /(^\s*)|(\s*$)/g;
    this.HTML_DECODE = {
        "&lt;" : "<", 
        "&gt;" : ">", 
        "&amp;" : "&", 
        "&nbsp;": " ", 
        "&quot;": "\"", 
        "©": ""

        // Add more
    };

    this.encodeHtml = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_HTML_ENCODE, 
                      function($0){
                          var c = $0.charCodeAt(0), r = ["&#"];
                          c = (c == 0x20) ? 0xA0 : c;
                          r.push(c); r.push(";");
                          return r.join("");
                      });
    };

    this.decodeHtml = function(s){
        var HTML_DECODE = this.HTML_DECODE;

        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_HTML_DECODE,
                      function($0, $1){
                          var c = HTML_DECODE[$0];
                          if(c == undefined){
                              // Maybe is Entity Number
                              if(!isNaN($1)){
                                  c = String.fromCharCode(($1 == 160) ? 32:$1);
                              }else{
                                  c = $0;
                              }
                          }
                          return c;
                      });
    };

    this.trim = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_TRIM, "");
    };


    this.hashCode = function(){
        var hash = this.__hash__, _char;
        if(hash == undefined || hash == 0){
            hash = 0;
            for (var i = 0, len=this.length; i < len; i++) {
                _char = this.charCodeAt(i);
                hash = 31*hash + _char;
                hash = hash & hash; // Convert to 32bit integer
            }
            hash = hash & 0x7fffffff;
        }
        this.__hash__ = hash;

        return this.__hash__; 
    };
}

addDecodeFunc.call(String.prototype);
function showtext(index) {
    console.log("show text: "+index);
    var content = `${postData['response']['posts'][index]['body']}`;
	
    var clean_content = content.replace(/<[^>]+>/g, "");
	clean_content = clean_content.replace("<br>", "\n");
	clean_content = clean_content.decodeHtml();
	var text = `<?xml version="1.0" encoding="UTF-8" ?>
		<document>
		  <descriptiveAlertTemplate>
			<title><![CDATA[${postData['response']['posts'][index]['title']}]]></title>
			<description showsScrollIndicator="true"><![CDATA[${clean_content}]]></description>
		  </descriptiveAlertTemplate>
		</document>`;
    console.log("text: " + text);
    doc = (new DOMParser).parseFromString(text, "application/xml");
    navigationDocument.pushDocument(doc);
}
