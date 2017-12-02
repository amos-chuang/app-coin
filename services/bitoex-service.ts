import * as Bluebird from "bluebird";
import * as https from "https";
import { IBitoexPriceModel } from "../models/view-models/bitoex-price-model";

export class BitoexService {
    public getPrice() {
        return new Bluebird<IBitoexPriceModel>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = "proxy.hine.net";
            options.port = 80;
            options.path = "https://www.bitoex.com/sync/dashboard_fixed/" + new Date().getTime();
            //options.host = "www.bitoex.com";
            //options.path = "/sync/dashboard_fixed/" + new Date().getTime();
            options.method = "GET";
            // options.headers = {
            //     "accept": "application/json, text/javascript, */*; q=0.01",
            //     "accept-encoding": "gzip, deflate, br",
            //     "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6",
            //     "cache-control": "no-cache",
            //     "cookie": "__cfduid=dc86e4326bfe6dcf50fcd210a5b7ef4d41509445247; lang=1; s945d95ff4be4efad=63d5d863d3a2de207d42effacca60dfc1f0507ab9eda6c9c3da055befd388993bc6f712e38079c8e; __asc=93eea6fa1601653bddc2c5588d0; __auc=b6d0ba3115f71f2a130e725b249; _ga=GA1.2.144875555.1509445247; _gid=GA1.2.1022373674.1512203075; _gat=1; BitoEXse2=ff52981279c59258135db7428bd1370a",
            //     "pragma": "no-cache",
            //     "referer": "https://www.bitoex.com/charts?locale=zh-tw",
            //     "user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
            // };
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        console.log("");
                        console.log("bitoex output");
                        console.log(output);
                        console.log("");
                        var obj = JSON.parse(output) as string[];
                        var model = {} as IBitoexPriceModel;
                        model.buyPrice = parseInt(obj[0].replace(",", ""));
                        model.sellPrice = parseInt(obj[1].replace(",", ""));
                        resolve(model);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.end();
        });
    }
}