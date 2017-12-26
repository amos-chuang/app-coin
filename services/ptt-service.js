"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const base_service_1 = require("./base-service");
const linqts_1 = require("linqts");
class PttService {
    getArticleList() {
        return new Bluebird((resolve, reject) => {
            new base_service_1.BaseService().httpGet("www.ptt.cc", "/bbs/DigiCurrency/index.html").then((res) => {
                var articleRegExp = /<a href=\"(.+?)\">(.+?)<\/a>/g;
                var matches = res.match(articleRegExp);
                if (matches) {
                    console.log(matches.length);
                    var result = [];
                    for (var line of matches) {
                        articleRegExp.lastIndex = 0;
                        var temp = articleRegExp.exec(line);
                        if (temp) {
                            result.push({
                                link: temp[0],
                                url: "https://www.ptt.cc" + temp[1],
                                title: temp[2]
                            });
                        }
                    }
                    resolve(result);
                }
                else {
                    reject("nothing match !!");
                }
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
    getDailyDiscussion() {
        return new Bluebird((resolve, reject) => {
            this.getArticleList().then((articleList) => {
                var article = new linqts_1.List(articleList).Where(x => x != null && x.title.indexOf("閒聊區") > 0).FirstOrDefault();
                resolve(article);
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
    getDailyDiscussionSweetgold() {
        //<string[]>
        return new Bluebird((resolve, reject) => {
            this.getDailyDiscussion().then((article) => {
                var url = article.url;
                url = url.substr(url.indexOf("://") + 3);
                var host = url.substr(0, url.indexOf("/"));
                var path = url.substr(url.indexOf("/"));
                console.log("host = " + host);
                console.log("path = " + path);
                return new base_service_1.BaseService().httpGet(host, path);
            }).then((content) => {
                var regex = /<div class="push">.*?push-userid.*?>(.*?)<.*?push-content.*?>(.*?)<.*?ipdatetime.*?> ([\w\W]+?)\n/ig;
                var matches = content.match(regex);
                if (matches) {
                    console.log(matches.length);
                    var result = [];
                    for (var line of matches) {
                        regex.lastIndex = 0;
                        var temp = regex.exec(line);
                        if (temp != null && temp[1] == "sweetgold") {
                            console.log(line);
                            result.push(temp[3] + " sweetgold " + temp[2]);
                        }
                    }
                    resolve(result);
                }
                else {
                    reject("nothing match !!");
                }
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
}
exports.PttService = PttService;
//# sourceMappingURL=ptt-service.js.map