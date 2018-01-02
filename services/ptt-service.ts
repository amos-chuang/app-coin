import * as Bluebird from "bluebird";
import * as https from "https";
import { BaseService } from "./base-service";
import { IArticleLinkModel } from "../models/view-models/ptt-article-link-model";
import { List } from "linqts";

export class PttService {
    public getArticleList() {
        return new Bluebird<IArticleLinkModel[]>((resolve, reject) => {
            new BaseService().httpGet("www.ptt.cc", "/bbs/DigiCurrency/index.html").then((res) => {
                var articleRegExp = /<a href=\"(.+?)\">(.+?)<\/a>/g;
                var matches = res.match(articleRegExp);
                if (matches) {
                    console.log(matches.length);
                    var result = [] as IArticleLinkModel[];
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
                } else {
                    reject("nothing match !!");
                }
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
    public getDailyDiscussion() {
        return new Bluebird<IArticleLinkModel>((resolve, reject) => {
            this.getArticleList().then((articleList) => {
                var article = new List<IArticleLinkModel>(articleList).Where(x => x != null && x.title.indexOf("閒聊區") > 0).FirstOrDefault();
                resolve(article);
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
    public getDailyDiscussionSweetgold() {
        //<string[]>
        return new Bluebird<string[]>((resolve, reject) => {
            this.getDailyDiscussion().then((article) => {
                var url = article.url;
                url = url.substr(url.indexOf("://") + 3);
                var host = url.substr(0, url.indexOf("/"));
                var path = url.substr(url.indexOf("/"));
                console.log("host = " + host);
                console.log("path = " + path);
                return new BaseService().httpGet(host, path);
            }).then((content) => {
                var regex = /<div class="push">.*?push-userid.*?>(.*?)<.*?push-content.*?>(.*?)<.*?ipdatetime.*?> ([\w\W]+?)\n/ig;
                var matches = content.match(regex);
                if (matches) {
                    console.log(matches.length);
                    var result = [] as string[];
                    for (var line of matches) {
                        regex.lastIndex = 0;
                        var temp = regex.exec(line);
                        if (temp != null && temp[1] == "sweetgold") {
                            console.log(line);
                            result.unshift(temp[3] + " sweetgold " + temp[2]);
                        }
                    }
                    resolve(result);
                } else {
                    reject("nothing match !!");
                }
            }).catch((e) => {
                console.log(e);
                reject(e);
            });
        });
    }
}