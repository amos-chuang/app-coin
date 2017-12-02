import * as Bluebird from "bluebird";
import * as https from "https";
import { IBitoexPriceModel } from "../models/view-models/bitoex-price-model";

export class BitoexService {
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