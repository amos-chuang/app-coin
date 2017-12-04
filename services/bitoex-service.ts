import * as Bluebird from "bluebird";
import * as https from "https";
import * as phantom from "phantom";
import { IBitoexPriceModel } from "../models/view-models/bitoex-price-model";

export class BitoexService {
    public getPriceByPhantom() {
        return new Bluebird<IBitoexPriceModel>(async (resolve, reject) => {
            const instance: phantom.PhantomJS = await phantom.create();
            const page: phantom.WebPage = await instance.createPage();
            const url: string = "https://www.bitoex.com/sync/dashboard_fixed/" + new Date().getTime();
            const status: string = await page.open(url);
            const content = JSON.stringify(await page.property('content'));
            const matches = /<pre.*>(.*)<\/pre>/.exec(content);
            let data = null;
            if (matches != null) {
                data = matches[1];
                data = data.replace(/\\/g, "");
                console.log("");
                console.log("bitoex");
                console.log(data);
                console.log("");
            }
            instance.exit();
            let result = {} as IBitoexPriceModel;
            if (data != null) {
                var obj = JSON.parse(data) as string[];
                var model = {} as IBitoexPriceModel;
                model.buyPrice = parseInt(obj[0].replace(/,/g, ""));
                model.sellPrice = parseInt(obj[1].replace(/,/g, ""));
                result = model;
            }
            resolve(result);
        });
    }
    public getPrice() {
        return new Bluebird<IBitoexPriceModel>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            // options.host = "proxy.hine.net";
            // options.port = 80;
            // options.path = "https://www.bitoex.com/sync/dashboard_fixed/" + new Date().getTime();
            options.host = "www.bitoex.com";
            options.path = "/sync/dashboard_fixed/" + new Date().getTime();
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        console.log("");
                        console.log("bitoex");
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