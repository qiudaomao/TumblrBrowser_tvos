var favData = null;
var currentMainPage = null;
var searchPage = null;
var getTumblrMainPage = function(callback) {
    var data = favData['data'];
    var text = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <listTemplate>
                <banner>
                    <title>Tumblr</title>
                </banner>
                <list>
                    <section>`;
    for (var item in data) {
        text += `
                        <listItemLockup onselect="showPost('${data[item]}')" onholdselect="remove('${data[item]}')">
                            <title><![CDATA[${data[item]}]]></title>
                            <relatedContent>
                                <lockup>
                                    <img src="https://api.tumblr.com/v2/blog/${data[item]}.tumblr.com/avatar/512" width="512" height="512" />
                                    <title>${data[item]}.tumblr.com</title>
                                </lockup>
                            </relatedContent>
                        </listItemLockup>`;
    }
    text += `
                        <listItemLockup onselect="addItemPage()">
                            <title>增加链接</title>
                            <relatedContent>
                                <lockup>
                                    <img src="abc" width="512" height="512" />
                                    <title>点击增加博客链接</title>
                                    <subtitle>长按列表中项目进行删除</subtitle>
                                </lockup>
                            </relatedContent>
                        </listItemLockup>
                    </section>
                </list>
            </listTemplate>
        </document>`;
    console.log("text: " + text);
    callback((new DOMParser).parseFromString(text, "application/xml"));
}

function showTumblrMainPage() {
    var favStr = localStorage.getItem('like');
    console.log("favStr: " + favStr);
    if (favStr == 'undefined' || favStr == null || typeof favStr === 'undefined') {
        var favStr = '{"data": []}';
    }
    console.log("favStr: " + favStr);
    favData = JSON.parse(favStr);
    getTumblrMainPage(function(doc) {
        currentMainPage = doc;
        navigationDocument.replaceDocument(doc, getActiveDocument());
    });
}

function addItemPage() {
    var text = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <formTemplate>
            <banner>
                <img src="Car_Movie_800X400.png" width="800" height="400"/>
                <description>输入博客名</description>
            </banner>
            <textField id="blogid"></textField>
            <footer>
                <button>
                    <text>确认</text>
                </button>
            </footer>
            </formTemplate>
        </document>`;
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, "application/xml");
    doc.addEventListener("select", function() {
        var emailEle = doc.getElementById("blogid");
        var keyboard=emailEle.getFeature('Keyboard');
        var email = keyboard.text;
        addItem(email);
    });
    searchPage = doc;
    navigationDocument.pushDocument(doc);
}

function addItem(blogid) {
    console.log("tryaddItem: "+blogid);
    for (var item of favData['data']) {
        if (item == blogid) {
            const alertDocument = createAlertDocument("错误", `${blogid}已经存在!`);
            navigationDocument.pushDocument(alertDocument);
            return;
        }
    }
    navigationDocument.pushDocument(createLoadingDocument(`查询${blogid}信息中..`));
    var url = `${HOST}/v2/blog/${blogid}/info?api_key=${API_KEY}`;
    getHTTP(url, function(content) {
        favData['data'].push(blogid);
        localStorage.setItem('like', JSON.stringify(favData));
        getTumblrMainPage(function(doc) {
            const alertDocument = createAlertDocument("成功", `成功添加${blogid}`);
            navigationDocument.replaceDocument(alertDocument, getActiveDocument());
            if (searchPage) {
                navigationDocument.removeDocument(searchPage);
            }
            navigationDocument.replaceDocument(doc, currentMainPage);
            currentMainPage = doc;
        });
    });
}

function remove(blogid) {
    console.log("remove blogid: " + blogid);
    let index=0;
    for (var item of favData['data']) {
        if (item == blogid) {
            favData['data'].splice(index, 1);
            localStorage.setItem('like', JSON.stringify(favData));
            const alertDocument = createAlertDocument("成功", `成功删除${blogid}`);
            navigationDocument.pushDocument(alertDocument);
            getTumblrMainPage(function(doc) {
                navigationDocument.replaceDocument(doc, currentMainPage);
                currentMainPage = doc;
            });
        }
        index++;
    }
}
